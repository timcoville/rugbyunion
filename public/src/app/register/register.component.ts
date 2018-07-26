import { Component, OnInit } from '@angular/core';
import { HttpService } from './../http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  errors: any;
  newUser: any;
  constructor(private _http: HttpService, private _router: Router) { }

  ngOnInit() {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      cPassword: ''
      
    }
    this.errors = []
  }


  register(){

    this._http.registerService(this.newUser)
      .subscribe(data=>{
        if(data['errors']){
          console.log(data['errors'])
          this.errors = data['errors']
        }
        else{
           console.log(data)
           this._http.setSessionService(data['_id'])
           return this._router.navigate(['home'])
           
        }
      });

    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      cPassword: ''
    }
  }

}
