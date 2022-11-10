import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'nwn-mars-category',
  templateUrl: './mars-category.component.html',
  styleUrls: ['./mars-category.component.css']
})
export class MarsCategoryComponent implements OnInit {
  powerBIURL ="https://app.powerbi.com/reportEmbed?reportId=ac9a478b-92a3-4c5c-ace7-c3189a554de0&autoAuth=true&ctid=2fc13e34-f03f-498b-982a-7cb446e25bc6"

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

}
