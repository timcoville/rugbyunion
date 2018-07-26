import { Component, OnInit } from '@angular/core';
import { HttpService } from './../http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  event: any;
  errors: any;
  authority: any;
  
  constructor(private _http: HttpService, private _router: Router) {
    this._http.verifySession()
   }

  ngOnInit() {
    this.event = {
      title: '',
      type: 'Event Type',
      startTime: '',
      address: {
        street: '',
        city: '',
        state: 'State',
        zip: ''
      },
      location: ''

    }
    this.errors = []
    this.getUser()
  }

  addEvent(){
    this._http.addEventService(this.event)
      .subscribe(data=>{
        console.log(data)
        if (data['errors']){
          this.errors = data['errors']
          this.event = {
            title: '',
            type: 'Event Type',
            startTime: '',
            address: {
              street: '',
              city: '',
              state: 'State',
              zip: ''
            },
            location: ''
      
          }
        if (data['_id']) {
          console.log("else working")
          return this._router.navigate(['schedule'])
        }
      }
    })
  }

  getUser(){
    this._http.getUserService()
      .subscribe(data=>{
        this.authority = data['authority']
        if (this.authority != 1){
          return this._router.navigate(['home'])
        }
      })
  }

  logout(){
    this._http.delSessionService()
  }

}
