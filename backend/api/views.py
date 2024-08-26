from django.shortcuts import render
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import generics, permissions
from .models import Profile
from .serializers import ProfileSerializer
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.contrib.staticfiles import finders
import os
from django.conf import settings
from django.http import JsonResponse
import base64
from PIL import Image,ImageDraw, ImageFont, ImageFilter
import numpy as np
import re
import textwrap
import cv2 


# Create your views here.

class ProfileRetrieveView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)



current_output_path = None
target_width = 1640
target_height = 840
min_width = 1439
max_width = 1640




def create_centered_text_image(text_list, base_image):
    # Set image dimensions
    transparent_img_size = (1380, 550)
    
    # Create a transparent image
    transparent_img = Image.new('RGBA', transparent_img_size, (0, 0, 0, 0))
    
    # Load a font with a larger size (adjust the path and size as needed)
    font_path = finders.find('fonts/MADEOkineSansPERSONALUSE-Bold.otf')  # Update this to the path of your .ttf font file
    font_size = 40  # Adjust the font size as needed
    if len(text_list) > 24:
        font_size = 30
    if len(text_list) <20:
        font_size = 50
    font = ImageFont.truetype(font_path, font_size)
    
    draw = ImageDraw.Draw(transparent_img)
    
    # Calculate dimensions for text
    max_items_per_column = 8
    if len(text_list) > 24:
        max_items_per_column = 12
        
    num_columns = (len(text_list) + max_items_per_column - 1) // max_items_per_column
    column_width = transparent_img_size[0] // num_columns
    
    # Start drawing text
    y_offset = 0
    current_column = 0
    
    for i, text in enumerate(text_list):
        if i > 0 and i % max_items_per_column == 0:
            current_column += 1
            y_offset = 0
        
        # Calculate text position using textbbox
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_x = (current_column * column_width) + (column_width - text_width) // 2
        text_y = y_offset * (transparent_img_size[1] // max_items_per_column)
        
        # Draw the text with a border
        border_size = 2  # Thickness of the border
        border_color = "black"
        for dx in range(-border_size, border_size + 1):
            for dy in range(-border_size, border_size + 1):
                if dx != 0 or dy != 0:  # Avoid drawing on the original text location
                    draw.text((text_x + dx, text_y + dy), text, font=font, fill=border_color)
        
        # Draw the main text on top of the border
        draw.text((text_x, text_y), text, font=font, fill="white")
        
        y_offset += 1
    
    # Convert the transparent image to RGBA format for blending
    transparent_img = transparent_img.convert("RGBA")
    
    # Convert the base image to RGBA if not already
    if base_image.mode != 'RGBA':
        base_image = base_image.convert('RGBA')
    
    # Calculate offset for centering the transparent image on the base image
    x_offset = (base_image.width - transparent_img.width) // 2
    y_offset = (base_image.height - transparent_img.height) // 2
    
    # Paste the transparent image onto the base image
    base_image.paste(transparent_img, (x_offset, 50), transparent_img)
    
    return base_image.convert('RGB')

def overlay_images(background_img, logo_img, frame_img, title, text_list):
    # Open and resize images using PIL
    background = Image.open(background_img).resize((1640, 820)).convert('RGBA')
    logo_provided = bool(logo_img)
    
    # Load or create frame and logo images
    if frame_img:
        frame = Image.open(frame_img).resize((1640, 820)).convert('RGBA')
    else:
        frame = Image.new('RGBA', (1640, 820), (255, 255, 255, 0))  # Transparent if not provided

    if logo_img:
        logo = Image.open(logo_img).convert('RGBA')
    else:
        logo = Image.new('RGBA', (100, 100), (255, 255, 255, 0))  # Transparent if not provided
    
    logo_width, logo_height = logo.size

    # Create a blank image of 1640x820
    combined_img = Image.new('RGBA', (1640, 820), (255, 255, 255, 0))

    # Blur and paste the background
    blurred_background = background.filter(ImageFilter.GaussianBlur(10))
    combined_img.paste(blurred_background, (0, 0), blurred_background)

    # Resize background image without stretching
    background_aspect_ratio = background.width / background.height
    new_height = 580
    new_width = int(new_height * background_aspect_ratio)
    background_resized = background.resize((new_width, new_height))
    
    # Paste resized background in the center of the frame
    offset = ((blurred_background.width - background_resized.width) // 2, 0)
    combined_img.paste(background_resized, offset)

    # Resize and paste the logo
    if logo_provided:
        logo_aspect_ratio = logo_width / logo_height
        new_logo_height = 100 
        new_logo_width = int(new_logo_height * logo_aspect_ratio)
        logo = logo.resize((new_logo_width, new_logo_height))
        
        cloud_size = (logo.width + 700, logo.height + 500)
        fade_radius = 40
        rect_height = logo.height + 60
        rect_width = logo.width + 20

        cloud_img = create_fading_oval_cloud(cloud_size, rect_height, rect_width, fade_radius)
        cloud_img.paste(logo, (10, 10), logo)
        combined_img.paste(cloud_img, (0, 0), cloud_img)

    # Paste the frame image
    combined_img.paste(frame, (0, 0), frame)

    # Load bold font for the title
    font_path = finders.find('fonts/MADEOkineSansPERSONALUSE-Bold.otf') # Adjust this path
    font_size = 60
    title_font = ImageFont.truetype(font_path, font_size)

    # Capitalize the title text
    title_text = title.upper()

    # Set color and image dimensions
    title_color = (255, 255, 255)
    image_width = 1640
    image_height = 820

    # Line spacing
    line_spacing = 20

    # Initialize the draw object
    title_draw = ImageDraw.Draw(combined_img)

    # Estimate the maximum number of characters per line based on the image width
    max_char_per_line = int(image_width / title_font.getlength('A'))

    # Wrap the text
    wrapped_text = textwrap.fill(title_text, width=max_char_per_line)
    lines = wrapped_text.split('\n')

    # Calculate the total height needed for the text with line spacing
    total_text_height = sum(
        title_draw.textbbox((0, 0), line, font=title_font)[3] - title_draw.textbbox((0, 0), line, font=title_font)[1]
        for line in lines
    ) + line_spacing * (len(lines) - 1)

    # Define the text area dimensions
    text_area_width = 1580
    text_area_height = 200

    # Calculate the starting x and y coordinates for the text area
    start_x = (image_width - text_area_width) / 2
    start_y = image_height - text_area_height - 10

    # Calculate the vertical position to start drawing the text so it's centered in the text area
    centered_start_y = start_y + (text_area_height - total_text_height) / 2

    # Draw each line of text within the text area
    for line in lines:
        text_bbox = title_draw.textbbox((0, 0), line, font=title_font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        x_position = start_x + (text_area_width - text_width) / 2
        title_draw.text((x_position, centered_start_y), line, font=title_font, fill=title_color)
        centered_start_y += text_height + line_spacing

    # Convert the combined image to RGB if needed for JPEG
    combined_img = combined_img.convert('RGBA')

    # Replace dashes with bullets in the text list and split it into individual items
    text_list = text_list.replace('-', "•")
    list_items = text_list.split('\n')
    
    # remove last character from list items but not from last item
    for i in range(len(list_items)):
        if i != len(list_items) - 1:
            list_items[i] = list_items[i][:-1]
            

    # Create the final image by overlaying text on the combined image
    final_img = create_centered_text_image(list_items, combined_img)
    
    return final_img.convert('RGB')


@csrf_exempt
def generateImage(request):
    if request.method == 'POST':
        title = request.POST.get('title', 'Default Title')
        text_list = request.POST.get('list', '[]')
        background_image = request.FILES.get('background_image')
        frame_image = request.FILES.get('frame_image', None)
        logo_image = request.FILES.get('logo_image', None)
       
        
        if not background_image:
            return JsonResponse({'error': 'Background image is required'}, status=400)


        # Call the overlay_images function
        output_image = overlay_images(background_image, logo_image, frame_image, title, text_list)

        # Save the output image
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploaded_images')
        os.makedirs(upload_dir, exist_ok=True)
        output_image_path = os.path.join(upload_dir, "output_image.jpg")
        output_image.save(output_image_path, 'JPEG')

        # Return the URL of the uploaded image
        output_image_url = request.build_absolute_uri(os.path.join(settings.MEDIA_URL, 'uploaded_images', "output_image.jpg"))

        # Encode image data to base64 string
        with open(output_image_path, 'rb') as image_file:
            output_image_data = base64.b64encode(image_file.read()).decode('utf-8')

        current_output_path = "output_image.avif"

        if title != "":
            title = title.lower()
            colon_index = title.find(':')
            if colon_index != -1:
                title = title[:colon_index]
            else:
                title = title
            title = ' '.join(title.split())
        
            translation_table = str.maketrans('', '', "!.;?/[]{}()#@^&*")

            # Use translate to remove the specified characters
            title = title.translate(translation_table)
            title = title.replace(" ", "_")
            if len(title) > 250:
                title = title[:250]
                
            title += ".avif"
            output_path = title
            current_output_path = output_path

        return JsonResponse({'output': output_image_url, 'output_image_data': output_image_data,'output_image_name':current_output_path})

       
    return JsonResponse({'error': 'Invalid request method'}, status=405)



     
        
        

   