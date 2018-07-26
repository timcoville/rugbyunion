import { Component, OnInit } from '@angular/core';
import { HttpService } from './../http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any;
  errors: any;
  constructor(private _http: HttpService, private _router: Router) { }

  ngOnInit() {
    this.user = {
      email: '',
      password: ''
    }
    this.errors = {}
  }

  login(){

    this._http.loginService(this.user)
      .subscribe(data=>{
        if (data['error']){
          console.log(data)
          this.errors = data['error']
          console.log(this.errors)
        } else {
          console.log(data)
          this._http.setSessionService(data['_id'])
          return this._router.navigate(['home'])
        }
        this.user = {
          email: '',
          password: ''
        }
      })
    }
}
