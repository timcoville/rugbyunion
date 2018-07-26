import { Component, OnInit } from '@angular/core';
import { HttpService } from './../http.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  event: any;
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
      title: '',
      type: '',
      startTime: '',
      location: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      }
    }
    this.getUser()
    this.getEvent()
  }

  getEvent() {
    this._http.getEventService(this.id)
      .subscribe(data=>{
        this.event = data['event'];
        console.log(this.event);
      })
  }

  getUser(){
    this._http.getUserService()
      .subscribe(data=>{

        this.authority = data['authority']
        
      })
  }
  
  deleteEvent(){
    this._http.deleteEventService(this.id)
      .subscribe(data=>{
        console.log('deleted')
        return this._router.navigate(['schedule'])
      })
  }
}
