import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'nwn-save-scenario-conform',
  templateUrl: './save-scenario-conform.component.html',
  styleUrls: ['./save-scenario-conform.component.css']
})
export class SaveScenarioConformComponent implements OnInit {
  @Output()
  buttonClickedEventConform = new EventEmitter()
  constructor() { }

  ngOnInit(): void {
  }
  saveScenarioConform(event){
    this.buttonClickedEventConform.emit(event)
  }
}
