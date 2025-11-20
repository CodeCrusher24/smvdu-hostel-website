from django.db import models


class Student(models.Model):
    student_id = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=128)
    course = models.CharField(max_length=64)
    year = models.CharField(max_length=32)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.student_id} - {self.name}"


class Room(models.Model):
    block = models.CharField(max_length=32)
    room_number = models.IntegerField()

    class Meta:
        unique_together = ('block', 'room_number')

    def __str__(self):
        return f"{self.block} {self.room_number}"


class Allocation(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='allocations')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='allocations')
    allocation_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=32, default='Occupied')

    class Meta:
        unique_together = ('student', 'room')

    def __str__(self):
        return f"{self.student} -> {self.room} ({self.status})"
