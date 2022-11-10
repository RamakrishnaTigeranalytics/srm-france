import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '@core/models';
import {AuthService,MetaService} from "@core/services"
import { environment } from 'src/environments/environment';

@Component({
  selector: 'nwn-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  user : User
  country = "France"
  groups : any[] = []
  country_img="/assets/subbrand-img/russia.png"
  constructor(private router: Router , private authService : AuthService , private metaService : MetaService) { }

  ngOnInit(): void {

    this.country_img = this.getcountry_flag()
    this.user=this.authService.userObservable.getValue()
    // this.user.user.groups = [{name:'pricing'}] as any;
    this.groups = this.user.user.groups.map(d=>d.name)
    console.log(this.user , "user value inhome page")
  }
  getcountry_flag(){
    const href = window.location.href
    if (href.includes('germany')){
      this.country = "GERMANY"
      this.metaService.setMeta({"currency" : "€" , "is_per_unit_in_promo" : false , 'tenant' : 'germany'})
      return "/assets/subbrand-img/germany.png"

    }
    else{
      this.country = "France"
      this.metaService.setMeta({"currency" : "€" , "is_per_unit_in_promo" : false , 'tenant' : 'france'})
      return "/assets/subbrand-img/uk.png"
    }

  }

  redirectPage(url: any){
    if(url == 'pricing-tool'){
      this.router.navigate(['/pricing-tool'])
      // window.open("https://mars-tool.azurewebsites.net/", '_blank')
    }
    else if(url == 'promo-tool'){
      if(environment.is_promo){
        this.router.navigate(['/promo'])

      }

    }
    else if(url == 'optimizer'){
      if(environment.is_optimizer){
        this.router.navigate(['promo/optimizer'])
      }
    }
    else if (url == 'profit-tool') {
      this.router.navigate(['/profit-tool']);
    //  window.open('https://app.powerbi.com/groups/1c41c8a6-0ea9-4934-8dcb-5488092877f7/list', '_blank');
  } else if (url == 'mars-category') {
      this.router.navigate(['/mars-category']);
  } else if (url == 'srm-insight') {
      this.router.navigate(['/promo-insight']);
    //  window.open('https://app.powerbi.com/groups/ae7317eb-cde7-424c-a918-f1510e00ef48/list', '_blank');
  }
    // else if(url == 'profit-tool'){
    //   this.router.navigate(['/profit'])
    // }
    // else if(url == 'pricing-capabilities'){
    //   this.router.navigate(['/pricing'])
    // }
    // else if(url == 'srm-insight'){
    //   this.router.navigate(['/srm'])
    // }
 }

}
