import { Component,Input,OnInit,Output,EventEmitter,SimpleChanges } from '@angular/core';
import {ProductWeek} from "../../../core/models"
import {PromotionService} from "@core/services"
import { Observable, of, from, BehaviorSubject, combineLatest } from 'rxjs';
import * as Utils from "@core/utils"
import * as utils from '@core/utils';
@Component({
    selector: 'nwn-weekly-promotion',
    templateUrl: './weekly-promotion.component.html',
    styleUrls: ['./weekly-promotion.component.css'],
})
export class WeeklyPromotionComponent implements OnInit {

    @Input()
    product_week:any = null as any;

    @Input()
    currency:any = null as any;
    @Input()
    tenant:any = null as any;
    singleSelect;
    config = {
        displayKey: 'name', // if objects array passed which key to be displayed defaults to description
        search: true,
        placeholder: 'Add promotion',
    };
    @Input()
    optionsWeeklyPromotion: any[] = [];
    @Input()
    promotion_map:any[] = []
    @Output()
    promotionChange =  new EventEmitter()

    @Input()
    units_in_promotion: any;

    ngOnInit(){
        // console.log(this.product_week , "product_weekproduct_weekproduct_weekproduct_weekproduct_week map")
        // console.log(this.promotion_map , "product_weekproduct_weekproduct_weekproduct_weekproduct_week this.promotion_map")
        // debugger
        let mp = this.promotion_map.filter(pr=>pr.week.week == this.product_week.week)
        if(mp.length > 0){
            this.singleSelect =  mp[0].selected_promotion
        }

        // console.log(this.year_quater , "year quater")
        // console.log(this.product_week , "promo week")
    }

    _get_uk_value($event){
        if($event?.value?.length !=0){
            var number = this.promoService.getPromoPrice($event.value)
            number = Number(parseFloat(number).toFixed(2))
            return number
        }

    }

    _get_germany_value($event){
        var number = 0
        console.log(this.product_week , "current product week")

        // this.promoService.getPromoPrice($event.value)
        var percentage = parseFloat($event.value.match(/[\d\.]+/))
        number = Utils.reducePercent(this.product_week.median_base_price_log , percentage)
        console.log(number , "extracted number")
        // var number = this.promoService.getPromoPrice($event.value)
        number = Number(number.toFixed(2))
        // parseFloat($event.value.match(/[\d\.]+/))
        return number

    }
    promotionChanged($event){
        if(this.tenant == 'france'){
            this.product_week.promo_price = this._get_uk_value($event)
            this.product_week.units_in_promotion = this.promoService.getUnitsSoldOnPromotion($event.value)
            if ($event.value?.length > 0) {
                this.units_in_promotion?.map((data) => {
                    if (data.promo_mechanic_1 === "Custom" && $event.value === data.generatedName) {
                        this.product_week.units_in_promotion = data.units_in_promotion
                        this.product_week.base_tactics = $event.value.split('-')[0];
                        this.product_week.promo_mechanic_1 = data.promo_mechanic_1;
                        this.product_week.promo_mechanic_2 = $event.value;
                    }
                })
            }
        }
        else if(this.tenant == 'germany'){
            this.product_week.promo_price = this._get_germany_value($event)
        }


        console.log(this.product_week , "product wek value")
        this.promotionChange.emit({"selected_promotion" : $event.value , "week" : this.product_week })

    }

    constructor(private promoService : PromotionService) {}

    // ngOnInit() {}
    ngOnChanges(changes : SimpleChanges) :void
    {
        // console.log(changes , "changes in promotion child compoant")
        if((changes.promotion_map) && !changes.promotion_map.firstChange){
            // debugger
            let val = changes.promotion_map.currentValue.find(e=>e.week.week == this.product_week.week)
            // console.log(val, "valll")
            if(val){
                this.singleSelect =  val.selected_promotion
            }
            // this.singleSelect =  changes.promotion_map.currentValue.selected_promotion
            // if(this.key == changes.promotion_map.currentValue){
            //     this.type = 'active'
            // }
            // else{
            //     this.type = 'default'
            // }
            // console.log(changes , "updated value promotion map")

        }

    }


}
