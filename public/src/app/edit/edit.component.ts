import { Component, OnInit } from '@angular/core';
import { HttpService } from './../http.service';
import { ActivatedRoute, Params, Router } from '@angular/router';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  event: any;
  errors: any;
  authority: any;
  id: any;
  
  constructor(private _http: HttpService, private _route: ActivatedRoute, private _router: Router) {
    this._http.verifySession()
    this._route.params.subscribe((params: Params) => {
      console.log(params['id'])
      this.id = params['id']
    });
  }

  ngOnInit() {
    this.event = {
      _id: '',
      title: '',
      type: '',
      startTime: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      location: ''

    }
    this.errors = []
    this.getUser()
    this.getEvent()
  }

  editEvent() {
    this._http.updateEventService(this.event)
      .subscribe(data=>{
        console.log(data)
        if(data['errors']){
          this.errors = data['errors']
          this.getEvent()
        } 
        if (data['_id']){
          return this._router.navigate(['schedule/'+this.event._id])
        }
      })
    
  }

  getEvent() {
    this._http.getEventService(this.id)
      .subscribe(data=>{
        this.event = data['event'];
        this.event.startTime = data['date']
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
