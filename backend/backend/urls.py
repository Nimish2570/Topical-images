from django.contrib import admin
from django.urls import path , include
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import generateImage
from django.conf.urls.static import static
from django.conf import settings
from api.views import ProfileUpdateView
from api.views import ProfileRetrieveView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api-auth/', include('rest_framework.urls')),
    path('generateImage/', generateImage), 
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
    path('profile/view/', ProfileRetrieveView.as_view(), name='profile-view'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

