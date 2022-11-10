import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalService } from '@molecules/modal/modal.service';
import {CheckboxModel} from "../../../core/models"

@Component({
  selector: 'nwn-manage-metrics',
  templateUrl: './manage-metrics.component.html',
  styleUrls: ['./manage-metrics.component.css']
})
export class ManageMetricsComponent implements OnInit {
  searchText : string = ""

  sales_metrics:Array<CheckboxModel> = [
    {"value":"Volume","checked":true},
    {"value":"Base Volume","checked":true},
    {"value":"Incremental Volume","checked":true},
    // {"value":"Volume","checked":true}
  ]
  mars_metrics:Array<CheckboxModel> = [
    {"value":"GSV","checked":true},
    {"value":"NSV","checked":true},
    {"value":"MAC","checked":true},
    {"value":"COGS","checked":true},
    {"value":"MAC, %NSV","checked":true},
    {"value":"TE, % GSV","checked":true},
    {"value":"Trade Expense","checked":true}
  ]

  retailer_metrics:Array<CheckboxModel> = [
    {"value":"ASP","checked":true},
    // {"value":"Promo ASP","checked":true},
    {"value":"RSV","checked":true},
    {"value":"Retailer Margin","checked":true},
    {"value":"Retailer Margin ,%RSV","checked":true}
  ]

  // other_metrics:Array<CheckboxModel> = [
  //   {"value":"ROI","checked":true},
  //   {"value":"Lift %","checked":true}
  // ]
  selected_metrics : Array<string> = [...this.sales_metrics.map(val=>val.value),...this.mars_metrics.map(val=>val.value),...this.retailer_metrics.map(val=>val.value)]
  @Output()
  metricChanges = new EventEmitter();

  constructor(private modal : ModalService ,) {}


  inputChangeEvent($event){
    this.searchText = $event
  }

  changeMetrics(e:CheckboxModel){
    // console.log(e , "change metric on checkbox change")
    if(e.checked){
      this.selected_metrics.push(e.value)

    }
    else{
      this.selected_metrics = this.selected_metrics.filter(val=>val!=e.value)
    }

    // console.log(this.selected_metrics, "change metric on checkbox change")

  }

  ngOnInit(): void {
  }
  closeModal(){
    // console.log(this.selected_metrics , "selected metrics")
    this.metricChanges.emit(this.selected_metrics)
    this.modal.close('manage-metrics')
  }

}
