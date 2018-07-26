import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashComponent } from './dash/dash.component';
import { ProfileComponent } from './profile/profile.component';
import { RosterComponent } from './roster/roster.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { AdminComponent } from './admin/admin.component';
import { StripeFormComponent } from './stripe-form/stripe-form.component';
import { EventComponent } from './event/event.component';
import { EditComponent } from './edit/edit.component';

/* const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'home', component: HomeComponent},
  {path: 'chat', component: ChatComponent}
];
 */
/* const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'home', component: HomeComponent, children:[
    {path: '', component: DashComponent},
    {path: 'chat', component: ChatComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'roster', component: RosterComponent}
  ]}
  
]; */

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'home', component: DashComponent},
  {path: 'chat', component: ChatComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'roster', component: RosterComponent},
  {path: 'schedule', component: ScheduleComponent},
  {path: 'admin', component: AdminComponent},
  {path: 'dues', component: StripeFormComponent},
  {path: 'schedule/:id', component: EventComponent},
  {path: 'schedule/:id/edit', component: EditComponent},
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
