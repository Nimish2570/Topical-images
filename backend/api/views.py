from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics 
from .serializers import UserSerializer
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

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)



current_output_path = None
target_width = 1640
target_height = 840
min_width = 1439
max_width = 1640




def overlay_images(background_img, logo_img, frame_img, title):
    # Open and resize images using PIL
    background = Image.open(background_img)
    background_width, background_height = background.size
    background = background.resize((1640, 820)).convert('RGBA')  
    logoProvided = True if logo_img else False

    
    if frame_img:
        frame = Image.open(frame_img).resize((1640, 820)).convert('RGBA')
    else:
        frame = Image.new('RGBA', (1640, 820), (255, 255, 255, 0))  # Transparent if not provided

    if logo_img:
        logo = Image.open(logo_img).convert('RGBA')
    else:
        logo = Image.new('RGBA', (100, 100), (255, 255, 255, 0))  # Transparent if not provided
    
    logo_width, logo_height = logo.size

    # Create a blank image with the of 1640x820
    combined_img = Image.new('RGBA', (1640, 820), (255, 255, 255, 0))

    # Paste the background image
    blurred_background = background.filter(ImageFilter.GaussianBlur(10))
    combined_img.paste(blurred_background, (0, 0), blurred_background)

    #resize background image without making it look stretched
    
    background_aspect_ratio =background_width / background_height
    new_height= 580
    new_width = int(new_height * background_aspect_ratio)
    background = background.resize((new_width, new_height))
    # paste in between the frame
    offset = ((blurred_background.width - background.width) // 2, 0)
    combined_img.paste(background, offset)

    
    # logo 
    logo_aspect_ratio = logo_width / logo_height
    new_logo_height = 100 
    new_logo_width = int(new_logo_height * logo_aspect_ratio)
    logo = logo.resize((new_logo_width, new_logo_height))
    # Paste the logo image
    def create_fading_oval_cloud(size,rect_height, rect_width, fade_radius):
        width, height = size
        cloud = Image.new('RGBA', size, (255, 255, 255, 0))  # Start with a fully transparent image
        
        # Create a mask for the fading effect
        mask = Image.new('L', size, 0)  # Start with a fully transparent mask
        mask_draw = ImageDraw.Draw(mask)
        
        # Draw the rectangle
        mask_draw.rectangle((0, 0, rect_width, rect_height), fill=255)  # Rectangle is white (opaque in cloud)
        
        # Draw the hemisphere
        mask_draw.ellipse((rect_width - rect_height//2, 0, rect_width + rect_height//2, rect_height), fill=255)  # Hemisphere is white (opaque in cloud)
        
        # Apply Gaussian blur to the mask
        mask = mask.filter(ImageFilter.GaussianBlur(fade_radius))
        
        # Apply the mask to the cloud image
        cloud.putalpha(mask)
        
        return cloud
    cloud_size = (logo.width + 700, logo.height + 500)
    fade_radius =  40# Adjust the fading radius as needed
    rect_height = logo.height +60 
    rect_width = logo.width + 20
    cloud_img = create_fading_oval_cloud(cloud_size, rect_height , rect_width, fade_radius)
    cloud_img.paste(logo, (10, 10), logo)
    if logoProvided:
        combined_img.paste(cloud_img, (0,0), cloud_img)

    # Paste the frame image

    combined_img.paste(frame, (0, 0), frame)


    # Load bold font
    font_path = finders.find('fonts/MADEOkineSansPERSONALUSE-Bold.otf')
    font_size = 50
    title_font = ImageFont.truetype(font_path, font_size)
   

    # Capitalize the title text
    title_text = title.upper()

    # Set color and image dimensions
    title_color = (255, 255, 255)
    image_width = 1640
    image_height = 820

    # Set line spacing
    line_spacing = 20  # Adjust this value as needed

    # Initialize the draw object
    title_draw = ImageDraw.Draw(combined_img)

    # Estimate the maximum number of characters per line based on the image width
    max_char_per_line = int(image_width / title_font.getlength('A'))

    # Wrap the text
    wrapped_text = textwrap.fill(title_text, width=max_char_per_line)

    # Split wrapped text into individual lines
    lines = wrapped_text.split('\n')
    # add 1 blank line at the end
    lines.append('')

    # Calculate the total height needed for the text with line spacing
    total_text_height = sum(
        title_draw.textbbox((0, 0), line, font=title_font)[3] - title_draw.textbbox((0, 0), line, font=title_font)[1]
        for line in lines
    ) + line_spacing * (len(lines) - 1)

    # Calculate the starting y-coordinate for the text (centered vertically from the bottom)
    start_y = image_height - total_text_height - 10

    # Draw each line of text with line spacing
    for line in lines:
        text_bbox = title_draw.textbbox((0, 0), line, font=title_font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        x_position = (image_width - text_width) / 2
        title_draw.text((x_position, start_y), line, font=title_font, fill=title_color)
        start_y += text_height + line_spacing  # Move down for the next line with spacing

    return combined_img.convert('RGB')
    # Convert to RGB if needed for JPEG

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
        output_image = overlay_images(background_image, logo_image, frame_image, title)

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

        return JsonResponse({'output': output_image_url, 'output_image_data': output_image_data, 'title': title, 'list': text_list})

       
    return JsonResponse({'error': 'Invalid request method'}, status=405)



     
        
        

   