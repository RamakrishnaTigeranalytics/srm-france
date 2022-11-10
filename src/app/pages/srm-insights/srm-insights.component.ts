import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'nwn-srm-insights',
  templateUrl: './srm-insights.component.html',
  styleUrls: ['./srm-insights.component.css']
})
export class SrmInsightsComponent implements OnInit {
  powerBIURL ="https://app.powerbi.com/reportEmbed?reportId=1f3b2213-02c4-4d12-b682-8db0f35a12e8&autoAuth=true&ctid=2fc13e34-f03f-498b-982a-7cb446e25bc6"

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

}
