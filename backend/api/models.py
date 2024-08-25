from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    pexels_api = models.CharField(max_length=255, blank=True, null=True)
    getImg_api = models.CharField(max_length=255, blank=True, null=True)
    width = models.IntegerField(default=1280)
    height = models.IntegerField(default=600)
    steps = models.IntegerField(default=4)
    output_format = models.CharField(max_length=255, default='jpeg')
    

    def __str__(self):
        return self.user.username

# Connect the Profile model with the User model using signals
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()
