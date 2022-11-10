import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'nwn-profit-tool',
  templateUrl: './profit-tool.component.html',
  styleUrls: ['./profit-tool.component.css']
})
export class ProfitToolComponent implements OnInit {
  powerBIURL ="https://app.powerbi.com/reportEmbed?reportId=c8e0a5ad-4662-4384-96cc-d0bd2f7dd1ec&autoAuth=true&ctid=2fc13e34-f03f-498b-982a-7cb446e25bc6"

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

}
