import { Component , Input, OnInit } from '@angular/core';
import { ModalService } from '@molecules/modal/modal.service';
import {OptimizerService} from '../../../core/services/optimizer.service'
import { ListPromotion} from "../../../core/models"
import { tickStep } from 'd3';
import { SimulatorService } from '@core/services';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'nwn-compare-promo-scenario',
    templateUrl: './compare-promo-scenario.component.html',
    styleUrls: ['./compare-promo-scenario.component.css'],
})
export class ComparePromoScenarioComponent implements OnInit {

    list_promotion:Array<ListPromotion> = []
    list_promotion_promo:Array<ListPromotion> = []
    list_promotion_optimizer:Array<ListPromotion> = []
    selected_id:Array<number> = []
    @Input()
    openTab = 2;
    @Input()
    currency;
    searchText = ''
    checkedValue = false;
    promotion_viewed:ListPromotion = null as any
    constructor(private toastr: ToastrService,private modal : ModalService,private optimize : OptimizerService,public restApi: SimulatorService){
        this.optimize.fetch_load_scenario()
    }
    ngOnInit(): void {
        this.checkedValue = false;
        this.restApi.ClearScearchText.asObservable().subscribe(data=>{
            console.log(data,"from modal apply")
            this.searchText = ""
          })
        this.optimize.getListObservation().subscribe(data=>{
            if(data){
                console.log(data , "list promotions")
                data.forEach((a:any) =>{
                    a.checked = false;
                })
                
                this.list_promotion = data
                this.list_promotion_promo = this.list_promotion.filter(data=>data.scenario_type == "promo")
                this.list_promotion_optimizer = this.list_promotion.filter(data=>data.scenario_type == "optimizer")
            }
        })
    }
    toggleTabs($tabNumber: number): void {
        this.openTab = $tabNumber;0
    }
    toggleId($event){
        console.log($event , "toggle event")
        this.list_promotion.forEach((a:any)=>{
            if(a.id == $event.value){
                a.checked = $event.checked
            }
        })
        this.list_promotion_promo = this.list_promotion.filter(data=>data.scenario_type == "promo")
        this.list_promotion_optimizer = this.list_promotion.filter(data=>data.scenario_type == "optimizer")

        if($event.checked){
            this.selected_id.push($event.value)

        }
        else{
            this.selected_id = this.selected_id.filter(n=>n!=$event.value)
        }
        // if(this.selected_id.includes(id)){
        //     this.selected_id = this.selected_id.filter(n=>n!=id)
        // }
        // else{
        //     this.selected_id.push(id)
        // }
        console.log(this.selected_id , "selected id selecting")

    }
    inputChangeEvent($event){
        this.searchText = $event
    }
    infoClicked($event){
    this.promotion_viewed = $event
    this.modal.open('promo-simulator-popup-compare')
        console.log($event , "Event")
    }
    openComparePopup(){
        // debugger
        this.checkedValue = false;
        this.list_promotion.forEach((a:any)=>{
            // if(a.id == $event.value){
                a.checked = false
           // }
        })
        this.list_promotion_promo = this.list_promotion.filter(data=>data.scenario_type == "promo")
        this.list_promotion_optimizer = this.list_promotion.filter(data=>data.scenario_type == "optimizer")

        console.log(this.selected_id , "selected id..........................")
        if(this.selected_id.length > 1){
            var ids = [ ...new Set(this.selected_id) ]
            this.optimize.setCompareScenarioIdObservable(ids)
            console.log(this.selected_id , "selected save id")
            this.modal.close('compare-promo-scenario')
            // this.modal.open('compare-scenario-popup')
        }
        else{
            this.toastr.error("Please select atleast two scenarios to compare")
        }
    }
    modalConfirmation($event){
        if($event == 'back'){
            this.modal.close('promo-simulator-popup-compare')
        }
        else if($event == 'load'){
            this.modal.close('promo-simulator-popup-compare')
            //this.loadScenario()
        }
    }
    deleteClickedEvent($event){


        this.modal.open("delete-scenario")
        // console.log($event , "delete event")
       

    }
    confirmationDelete($event){
        console.log(this.promotion_viewed , "protoion detaile to delete")
        console.log(this.promotion_viewed.id , "id to delete")
        console.log($event , "confimatin delete at load scenario")
        this.modal.close("delete-scenario")
        if($event == 'delete'){
            this.optimize.deletePromoScenario(this.promotion_viewed.id).subscribe(data=>{
                this.optimize.deleteListPromotion(this.promotion_viewed.id)
                this.modal.close("promo-simulator-popup-compare")
            },err=>{
                console.log(err , "error")
            })

        }
        if($event == true){
            this.modal.close("delete-scenario");
            this.modal.open("compare-promo-scenario");
            this.modal.open("promo-simulator-popup-compare");
        }
    }
}
