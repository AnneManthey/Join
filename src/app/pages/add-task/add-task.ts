import { Component } from '@angular/core';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { AddTaskForm } from '../board/components/add-task-form/add-task-form';

@Component({
  selector: 'app-add-task',
  imports: [Header, Navbar, RouterOutlet, AddTaskForm],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {}