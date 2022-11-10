import { Component, OnInit } from '@angular/core';
import{AuthService } from "@core/services"
import { Router,NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '@core/models';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'nwn-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent implements OnInit {
    user$ : Observable<User>
    is_promo= environment.is_promo
    is_optimizer= environment.is_optimizer
    is_dash= environment.is_dash
    login_route =['/login']
    homePage = ['/home-page' , '/country-page' , '/']
    hide_side = false
    is_logged_in = false
    groups : any[] = []
    constructor(private authService : AuthService,private router: Router){
        router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                // console.log(val, 'VAL OF ROUTER ');
                console.log(val.url, 'VAL OF ROUTER ');
                if (this.login_route.includes(val.url) || this.homePage.includes(val.url)) {
                  // this.hideNav()
                  this.hide_side = true;
                } else {
                  this.hide_side = false;
                }

              }
        });

    }
    ngOnInit(){
        this.user$ = this.authService.getUser()
        this.user$.subscribe((data:any)=>{
            console.log(data , "user data...")
            if(data){
            //    data.user.groups = [{name:'pricing'}]
               this.groups = data.user.groups.map(d=>d.name)
               this.is_logged_in = true
            }
        })
    }
    redirectPage(url:any){
         if (url == 'profit-tool') {
            this.router.navigate(['/profit-tool']);
          //  window.open('https://app.powerbi.com/groups/1c41c8a6-0ea9-4934-8dcb-5488092877f7/list', '_blank');
        } else if (url == 'mars-category') {
            this.router.navigate(['/mars-category']);
        } else if (url == 'srm-insight') {
            this.router.navigate(['/srm-insight']);
          //  window.open('https://app.powerbi.com/groups/ae7317eb-cde7-424c-a918-f1510e00ef48/list', '_blank');
        }else if(url == 'pricing-tool'){
            this.router.navigate(['/pricing-tool'])
        }
    }

    logout(){
this.authService.logout().subscribe(data=>{
     localStorage.removeItem('token');
    localStorage.removeItem('user')
    this.authService.isLoggedInObservable.next(false);
    this.authService.setUser(null as any)
    // this.router.navigate(['/login'])
    this.router.navigate(['/france/login'])
})

    }
}
