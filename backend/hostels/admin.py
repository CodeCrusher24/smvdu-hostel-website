from django.contrib import admin
from .models import Student, Room, Allocation


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("student_id", "name", "course", "year")
    search_fields = ("student_id", "name", "course")


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("block", "room_number")
    list_filter = ("block",)
    search_fields = ("block", "room_number")


@admin.register(Allocation)
class AllocationAdmin(admin.ModelAdmin):
    list_display = ("student", "room", "allocation_date", "status")
    list_filter = ("status", "room__block")
    search_fields = ("student__student_id", "student__name", "room__block")
