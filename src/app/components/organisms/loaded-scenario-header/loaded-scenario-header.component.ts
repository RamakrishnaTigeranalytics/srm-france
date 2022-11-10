import { Component, Input, Output, EventEmitter, OnInit, OnDestroy,SimpleChanges } from '@angular/core';
// import {OptimizerService} from '../../../core/services/optimizer.service'
import {OptimizerService , SimulatorService , PromotionService} from "@core/services"
// import {ProductWeek , Product, CheckboxModel,LoadedScenarioModel} from "../../../core/models"
import {ProductWeek , Product, CheckboxModel,LoadedScenarioModel , UploadModel, FilterModel, ListPromotion, ProductWeekUk} from "@core/models"
import { Observable, of, from, BehaviorSubject, combineLatest , Subject } from 'rxjs';
import {takeUntil} from "rxjs/operators"
import * as utils from "@core/utils"
import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';
@Component({
    selector: 'nwn-loaded-scenario-header',
    templateUrl: './loaded-scenario-header.component.html',
    styleUrls: ['./loaded-scenario-header.component.css'],
})
export class LoadedScenarioHeaderComponent implements OnInit,OnDestroy {
    private unsubscribe$: Subject<any> = new Subject<any>();
    @Input()
    currency
    @Input()
    tenant
    @Input()
    hidepanel = true
    @Input()
    disable_button = true
    @Input()
    title: string = 'Untitled';
    scenarioName = "Promo"
    @Output()
    filterResetEvent = new EventEmitter()
    @Output()
    modalEvent = new EventEmitter<string>();
    @Output()
    downloadEvent = new EventEmitter<any>();
    @Output()
    simulateResetEvent = new EventEmitter<{"action" : string,"promotion_map" : Array<any> , "promo_elasticity" : number}>();
    @Input()
    filter_model : FilterModel
    @Input()
    disable_save_download = true
    @Input()
    units_in_promotion: any;
    options1:Array<any> = [];
    promotions$: Observable<string[]> = null as any;
    product_week:any[] = [];
    genobj : {[key:string] : any[]  } = {}
    quarter_year:Array<string> = [];
    selected_quarter:string = ''
    selected_product_week : any[] = []
    promotion_map:Array<any> = [] //{"selected_promotion" : $event.value , "week" : this.product_week }
    available_year:any[] = ["1 year" , "2 years" , "3 years"]
    loaded_scenario:LoadedScenarioModel = null as any
    promo_elasticity = 0

    // hidepanel = true
    constructor(private toastr: ToastrService,
        private optimize : OptimizerService,
        private simulatorService : SimulatorService,
        private promoService : PromotionService){

    }
    _populateWeekGermany(weekdata){

            // this.optimize.getProductWeekObservable().pipe(
        //     takeUntil(this.unsubscribe$)
        // ).subscribe(weekdata=>{
            console.log(weekdata , "week data errors germany")
            if(weekdata.length == 0){
                // this.hidepanel = true
                this.product_week = []
                this.optimize.set_baseline_null()
                this.available_year =["1 year" , "2 years" , "3 years"]
                this.quarter_year = []
                this.selected_quarter = ''
                this.selected_product_week  = []
                this.optimize.setPromotionObservable([])
                this.disable_button = true
                this.promotion_map = []
                this.promo_elasticity = 0

            }
            else{
                console.log(weekdata , "weekdata...................")
                let promo_depth : Array<string> = [];

                (weekdata as ProductWeek[]).forEach(data =>{

                    // let sdata = (data as ProductWeekUk)

                    // let gen_promo = ''
                    let gen_promo = utils.genratePromotionGermany(
                        parseFloat(data.tpr_discount),
                        parseFloat(data.flag_promotype_leaflet),
                        parseFloat(data.flag_promotype_display),
                        parseFloat(data.flag_promotype_distribution_500)
                    )
                    data.promotion_name = gen_promo
                    if(gen_promo && !promo_depth.includes(gen_promo)){

                        promo_depth.push(gen_promo)
                    }
                    let str = "Y" + 1 + " Q"+data.quater as string
                    if(!this.quarter_year.includes(str)){
                        this.quarter_year.push(str);

                    }
                    // if(str in this.genobj){
                    //     this.genobj[str].push(data)
                    //     // append(data)
                    // }
                    // else{
                    //     this.quarter_year.push(str);
                    //     this.genobj[str] = [data]
                    // }
                    // data.promo_depth = parseInt(data.promo_depth)
                    // data.co_investment = (data.co_investment)

                })
                // debugger
                //console.log(this.available_year , "Available year")
                // this.options1 = promo_depth
                // this.optimize.set_base_line_promotion(promo_depth)
                // this.options1 = this.optimize.get_base_line_promotions()

                this.optimize.setBaseLineObservable(promo_depth)
                this.options1 = promo_depth
                //console.log(this.options1 , "options for drop down promotion")
                this.product_week = weekdata
                // this.hidepanel = false
                this.selected_quarter = this.quarter_year[0]
                this.selected_product_week  = this.product_week.filter(data=>data.quater == parseInt(
                    this.selected_quarter.split("Q")[1]
                    )
                    ).sort((a,b)=>(a.week > b.week) ? 1 : ((b.week > a.week) ? -1 : 0))
                //console.log(this.genobj , "gen obj")

                this.disable_button = false

              }

        //     },

        //    error=>{
        //     //console.log(error , "error")
        //   })

    }
    _populateWeekUK(weekdata){
        // this.optimize.getProductWeekObservable().pipe(
        //     takeUntil(this.unsubscribe$)
        // ).subscribe(weekdata=>{
            console.log(weekdata , "week data errors")
            if(weekdata.length == 0){
                // this.hidepanel = true
                this.product_week = []
                this.optimize.set_baseline_null()
                this.available_year =["1 year" , "2 years" , "3 years"]
                this.quarter_year = []
                this.selected_quarter = ''
                this.selected_product_week  = []
                this.optimize.setPromotionObservable([])
                // this.disable_button = true
                this.promotion_map = []
                this.promo_elasticity = 0

            }
            else{
                console.log(weekdata , "weekdata...................")
                let promo_depth : Array<string> = [];

                (weekdata as ProductWeekUk[]).forEach(data =>{
                    // debugger
                    // data.base_tactics =
                    // let sdata = (data as ProductWeekUk)

                    // let gen_promo = ''
                    let gen_promo = utils.genratePromotionUK(
            data.base_tactics,data.tpr_discount , data.flag_promotype_display_ge ,
            data.flag_promotype_display_ss , data.flag_promotype_pl,data.flag_promotype_poweraisle,
            data.flag_promotype_consumer_promotions
                    )
                    data.promotion_name = gen_promo
                    if(gen_promo && !promo_depth.includes(gen_promo)){

                        promo_depth.push(gen_promo)
                    }
                    let str = "Y" + 1 + " Q"+data.quater as string
                    if(!this.quarter_year.includes(str)){
                        this.quarter_year.push(str);

                    }
                    // if(str in this.genobj){
                    //     this.genobj[str].push(data)
                    //     // append(data)
                    // }
                    // else{
                    //     this.quarter_year.push(str);
                    //     this.genobj[str] = [data]
                    // }
                    // data.promo_depth = parseInt(data.promo_depth)
                    // data.co_investment = (data.co_investment)

                })
                //console.log(this.available_year , "Available year")
                // this.options1 = promo_depth
                // this.optimize.set_base_line_promotion(promo_depth)
                // this.options1 = this.optimize.get_base_line_promotions()
                // this.optimize.setBaseLineObservable(promo_depth)
                // this.options1 = promo_depth
                //console.log(this.options1 , "options for drop down promotion")
                this.product_week = weekdata
                // this.hidepanel = false
                this.selected_quarter = this.quarter_year[0]
                this.selected_product_week  = this.product_week.filter(data=>data.quater == parseInt(
                    this.selected_quarter.split("Q")[1]
                    )
                    ).sort((a,b)=>(a.week > b.week) ? 1 : ((b.week > a.week) ? -1 : 0))
                //console.log(this.genobj , "gen obj")

                this.disable_button = false

              }

        //     },

        //    error=>{
        //     //console.log(error , "error")
        //   })
    }
    tacticData = [] as any;
    populateWeekPromotions(tactic){
        this.tacticData =[];
        if(tactic != undefined){
            tactic.forEach(data =>{
            
                if(data.promo_mechanic_1 != "Display & Leaflet" && data.promo_mechanic_1 != "Custom" ){
                    this.tacticData.push(data.promo_mechanic_2)                   
                }
            })
            this.optimize.setBaseLineObservable(this.tacticData)
            this.options1 = this.tacticData
        }
        
    }
    _germany_uploaded_data(uploadData){
        let gen_array:any[] = []
        uploadData.simulated.weekly.forEach((data,index)=>{
            // this.promotion_map
            let leaflet = data.promo_mechanics == 'Leaflet'? 1 : 0
            let display = data.promo_mechanics == 'Display'? 1 : 0
            let distribution =  data.promo_mechanics == 'Distribution'? 1 : 0
            let gen_promo = utils.genratePromotionGermany(
                data.promo_depth,leaflet,display,distribution
                )
                if(gen_promo){
                    gen_array.push(gen_promo)
                    // this.optimize.insert_base_line_promotion(gen_promo)
                    this.promotion_map.push({

                        "selected_promotion" : gen_promo ,
                         "week" : uploadData.base[index]
                    })

                }


        })
        console.log(this.promotion_map , "promotion map uploaded")
        // debugger
        this.optimize.setBaseLineObservable(gen_array)
        this.optimize.setProductWeekObservable(uploadData.base)

    }

    _uk_uploaded_data(uploadData){
        let gen_array:any[] = []
        uploadData.simulated.weekly.forEach((data,index)=>{
            uploadData.base[index].base_tactics = data.promo_mechanic_2
            uploadData.base[index].promo_price = data.promo_price

            // debugger
            // this.promotion_map
            // let leaflet = data.promo_mechanics == 'Leaflet'? 1 : 0
            // let display = data.promo_mechanics == 'Display'? 1 : 0
            // let distribution =  data.promo_mechanics == 'Distribution'? 1 : 0
            let gen_promo = data.promo_mechanic_2
            // utils.genratePromotionGermany(
            //     data.promo_depth,leaflet,display,distribution
            //     )
                if(gen_promo){
                    gen_array.push(gen_promo)
                    // this.optimize.insert_base_line_promotion(gen_promo)
                    this.promotion_map.push({

                        "selected_promotion" : gen_promo ,
                         "week" : uploadData.base[index]
                    })

                }


        })
        console.log(this.promotion_map , "promotion map uploaded")
        // debugger
        this.optimize.setBaseLineObservable(gen_array)
        this.optimize.setProductWeekObservable(uploadData.base)

    }
    ngOnInit(){
        console.log(this.tenant , "tenant id")
        let promoWeekObservable$ = this.optimize.getProductWeekObservable()
        let loadedScenarioObservable$ = this.optimize.getLoadedScenarioModel()
        let uploadedObservable$ =  this.optimize.getUploadedScenarioObservable()
        if(this.tenant == "france"){
            promoWeekObservable$.pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(data=>{
                this.promotion_map =  []
                this.disable_save_download = true;
                this._populateWeekUK(data)
                
            },
            error=>{
                console.log(error , "error")
            })
            this.promoService.getTactics().subscribe(item => {
                this.populateWeekPromotions(item)
            });
            loadedScenarioObservable$.pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(data=>{
                if(data){
                    this.populatePromotionWeekUK(data)
                    this.promoService.setTactics(data['tactics'])
                    this.title = data.scenario_name
                    this.scenarioName = data.scenario_type
                    // this.promo_elasticity = data.promo_elasticity | 0
                }
                else{
                    this.title = "Untitled"
                }

            })

            uploadedObservable$.pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe((uploadData:UploadModel)=>{
                if(uploadData){
this._uk_uploaded_data(uploadData)
                }

            },
            err=>{
                throw err
            })

        }
        else if(this.tenant == 'germany'){
            promoWeekObservable$.pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(data=>{


                this._populateWeekGermany(data)
            },
            error=>{
                console.log(error , "error")
            })
            loadedScenarioObservable$.pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(data=>{
                if(data){
                    this.populatePromotionWeekGermany(data)
                    this.title = data.scenario_name
                    this.promo_elasticity = data.promo_elasticity | 0
                }
                else{
                    this.title = "Untitled"
                }

            })
            uploadedObservable$.pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe((uploadData:UploadModel)=>{
                if(uploadData){
                    this._germany_uploaded_data(uploadData)

                }

            },
            err=>{
                throw err
            })


        }


        // let promoWeekObservable$ = this.optimize.getProductWeekObservable()
    //    .subscribe((uploadData:UploadModel)=>{
    //         if(uploadData){


    //         }

    // //

    //     })



       this.optimize.getPromotionObservable().pipe(
        takeUntil(this.unsubscribe$)
       ).subscribe(data=>{
           if (data.length > 0){
               //console.log(data , "get promotion data")
               this.options1 = [];
               this.options1 = data
               //console.log(this.options1, "options 1")

           }

       })


    }

    closeClicked($event){
        // closeClicked

        this.filterResetEvent.emit($event)

    }

    weekTotalOb:any = [];
    downloadWeeklyInput(){

        this.weekTotalOb  = [];
        if(this.disable_button){
            return
        }
        let tactics: any = [];

        this.promoService.getTactics().subscribe(item => {
            tactics = item;
        });
        let weekData: any = [];
        if(this.promotion_map.length > 0 && this.units_in_promotion?.length > 0 ){
            var tactisfilter = tactics.filter(a=>a.promo_mechanic_1 !='Display & Leaflet' && a.promo_mechanic_1 !='Custom');
            var allPromos = this.units_in_promotion.concat(tactisfilter)
            allPromos = allPromos.filter(promo => promo.generatedName !== promo.promo_mechanic_2)
            allPromos.map((item) => {
                if (allPromos.find(promo => promo.generatedName != promo.promo_mechanic_2)) {
                    if(!item.promo_mechanic_1) {
                        delete item.promo_mechanic_1;
                        delete item.generatedName;
                    }
                }
            })
            weekData = this.promotion_map.map((week) => {
                let tactic: any = {};
                tactic = allPromos.find(item => item.promo_mechanic_2 === week.selected_promotion || item.generatedName === week.selected_promotion);
                if (tactic) {

                    if(tactic.promo_mechanic_2?.includes("Leaflet") || tactic.generatedName?.includes("Leaflet")){
                        week.week.flag_promotype_leaflet = 1;
                    }
                    if(tactic.promo_mechanic_2?.includes("Display") || tactic.generatedName?.includes("Display")){
                        week.week.flag_promotype_display =1;
                    }
                    week.week.promo_mechanic_1 = tactic.promo_mechanic_1;
                    week.week.promo_mechanic_2 = tactic.promo_mechanic_2 || tactic.generatedName;
                    week.week.promotion_name = tactic.promo_mechanic_2 || tactic.generatedName;
                    week.week.base_tactics = tactic.promo_mechanic_2 || tactic.generatedName;
                    tactic.generatedName && (week.week.promo_depth = tactic.generatedName?.includes('%') && +tactic.generatedName.split('-')[1].replace('%', ''));
                    tactic.generatedName && (week.week.promo_price = tactic.generatedName?.includes('€') && +tactic.generatedName.split('-')[1].replace('€', ''));
                } else {
                    week.week.promo_mechanic_1 = "";
                    week.week.promo_mechanic_2 = "";
                }
                return week.week;
            })

            this.weekTotalOb=this.optimize.getProductWeekData();
        } else {
            weekData = this.optimize.getProductWeekData().map((week) => {
                let tactic: any = {};
                tactic = tactics.filter(tactic => tactic.promo_mechanic_1 === "Multibuy").find(item => item.promo_mechanic_2 === week.base_tactics);
                if (tactic) {
                    week.promo_mechanic_1 = tactic.promo_mechanic_1;
                    week.promo_mechanic_2 = tactic.promo_mechanic_2;
                } else {
                    week.promo_mechanic_1 = "";
                    week.promo_mechanic_2 = "";
                }
                return week;
            })
            this.weekTotalOb = this.optimize.getProductWeekData();
        }
        //console.log(this.filter_model , "avaible model")
        let queryObj = {
            "account_name" : this.filter_model.retailer,
            "product_group" : this.filter_model.product_group,
            "weekly" :this.weekTotalOb
        }

        // let pw =
        // let promo = this.optimize.get_base_line_promotions()

        this.simulatorService.downloadWeeklyDataInputTemplate(queryObj).subscribe(data=>{
            this.toastr.success('File Downloaded Successfully','Success');
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            FileSaver.saveAs(
                blob,
                this.tenant+ '_WeeklyInput' + '_Template_' + new Date().getTime() + 'xlsx'
            );
        })

    }

    populatePromotionWeekGermany(scenario : any){
        let pw:ProductWeek[]=[];
        //console.log(this.promotion_map , "promotion map vallllllllllllllllllllllllllllllll")
        this.promotion_map = []

        scenario.base.weekly.forEach((data,index)=>{
            let simulated_depth = scenario.simulated.weekly[index].promo_depth
            // let simulated_coinv = scenario.simulated.weekly[index].co_investment
            let simulated_leaflet = scenario.simulated.weekly[index].flag_promotype_leaflet
            let simulated_display = scenario.simulated.weekly[index].flag_promotype_display
            let simulated_distribution = scenario.simulated.weekly[index].flag_promotype_distribution_500
            if(simulated_depth){
                this.promotion_map.push({
                    "selected_promotion" : utils.genratePromotionGermany(simulated_depth,
                        simulated_leaflet,simulated_display,simulated_distribution

                    ) ,
                     "week" : data
                })
            }
            pw.push({
                "model_meta": 0,
                "year": parseInt(data.year),
                "quater": data.quater,
                "month": data.month,
                "period": data.period,
                "week": data.week,
                "date": data.date,
                "median_base_price_log" : parseFloat(data.median_base_price_log.toFixed(2)),
                "tpr_discount":  parseFloat(data.promo_depth.toFixed(2)),
                "flag_promotype_leaflet": data.flag_promotype_leaflet,
                "flag_promotype_display": data.flag_promotype_display,
                "flag_promotype_distribution_500": data.flag_promotype_distribution_500,
                "promo_price" : parseFloat(scenario.simulated.weekly[index].asp.toFixed(2))
               })
        })
        this.optimize.setProductWeekObservable(pw)

    }
    populatePromotionWeekUK(scenario : any){
        let pw:ProductWeekUk[]=[];
        //console.log(this.promotion_map , "promotion map vallllllllllllllllllllllllllllllll")
        this.promotion_map = []
        scenario.simulated.weekly.forEach((data,index)=>{
            // debugger
            let simulated_depth = scenario.simulated.weekly[index].promo_depth

            // let simulated_coinv = scenario.simulated.weekly[index].co_investment
            if(scenario.simulated.weekly[index].tactic){
                this.promotion_map.push({
                    "selected_promotion" :  scenario.simulated.weekly[index].tactic,
                     "week" : data
                })
            }
            pw.push({
                "model_meta": 0,
                "year": parseInt(data.year),
                "quater": data.quater,
                "month": data.month,
                "period": data.period,
                "week": data.week,
                "date": data.date,
                "median_base_price_log" : parseFloat(data.median_base_price_log.toFixed(2)),
                "tpr_discount":  parseFloat(data.promo_depth.toFixed(2)),
                "flag_promotype_chille":data.flag_promotype_chille,
"flag_promotype_clubcard":data.flag_promotype_clubcard,
"flag_promotype_consumer_promotions":data.flag_promotype_consumer_promotions,
"flag_promotype_display_ge":data.flag_promotype_display_ge,
"flag_promotype_display_ss":data.flag_promotype_display_ss,
"flag_promotype_long_term_multibuy": data.flag_promotype_long_term_multibuy,
"flag_promotype_long_term_tpr":data.flag_promotype_long_term_tpr,
"flag_promotype_pl":data.flag_promotype_pl,
"flag_promotype_poweraisle":data.flag_promotype_poweraisle,
"flag_promotype_short_term_multibuy":data.flag_promotype_short_term_multibuy,
"flag_promotype_short_term_tpr":data.flag_promotype_short_term_tpr,
"base_tactics": data.tactic,
"promo_price" : parseFloat(scenario.simulated.weekly[index].asp.toFixed(2))
               })

        })
        this.optimize.checkPromotions(this.promotion_map)
        this.optimize.setProductWeekObservable(pw)
        this.copyBaselineUK();  

    }
    populatePromotionWeek(scenario : LoadedScenarioModel){
        let pw:ProductWeek[]=[];
        //console.log(this.promotion_map , "promotion map vallllllllllllllllllllllllllllllll")
        this.promotion_map = []

        scenario.base.weekly.forEach((data,index)=>{
            let simulated_depth = scenario.simulated.weekly[index].promo_depth
            let simulated_coinv = scenario.simulated.weekly[index].co_investment
            let simulated_n_plus_1 = scenario.simulated.weekly[index].flag_promotype_n_pls_1
            let simulated_motivation = scenario.simulated.weekly[index].flag_promotype_motivation
            let simulated_traffic = scenario.simulated.weekly[index].flag_promotype_traffic
            //console.log(simulated_depth , "simulated depth")
            if(simulated_depth){
                //{"selected_promotion" : $event.value , "week" : this.product_week }
                this.promotion_map.push({
                    "selected_promotion" : utils.genratePromotion(
                        simulated_motivation,simulated_n_plus_1,simulated_traffic,simulated_depth,
                        simulated_coinv

                    ) ,
                     "week" : data
                })
            }
        //    pw.push({
        //     "model_meta": 0,
        //     "year": parseInt(data.year),
        //     "quater": data.quater,
        //     "month": data.month,
        //     "period": data.period,
        //     "week": data.week,
        //     "date": data.date,
        //     // "promo_depth": data.promo_depth,
        //     // "co_investment": data.co_investment,
        //     // "flag_promotype_motivation": data.flag_promotype_motivation,
        //     // "flag_promotype_n_pls_1": data.flag_promotype_n_pls_1,
        //     // "flag_promotype_traffic": data.flag_promotype_traffic
        //    })

        })
        //console.log(this.promotion_map , "final promotion map")
        this.optimize.setProductWeekObservable(pw)

    }
    promotionChange($event:any){
        let promo =  this.promotion_map.find(p=>p.week.week == $event.week.week)
        //console.log(promo , "promo filtered")
        let tactics: any = [];

        this.promoService.getTactics().subscribe(item => {
            tactics = item;
        });
        // debugger
        if(promo){
            // this.promotion_map.filter((item) => item.selected_promotion !== promo['selected_promotion'])
            for( let i = 0; i < this.promotion_map.length; i++){
                if ( this.promotion_map[i].selected_promotion === promo['selected_promotion'] && this.promotion_map[i].week.week === promo.week.week) {
                   // this.promotion_map.splice(i, 1);
                   if($event['selected_promotion'].length == 0){
                    this.promotion_map.splice(i, 1);
                   }else{
                    this.promotion_map[i].selected_promotion = $event['selected_promotion']
                    this.promotion_map[i].week.base_tactics = $event['selected_promotion']
                    this.promotion_map[i].week.promotion_name = $event['selected_promotion']
                   }
                   
                }
            }
        }
        else{
            this.promotion_map = [...this.promotion_map, $event];
            // this.promotion_map.push($event)

        }
        //console.log($event , "promotion change in header")
        //console.log(this.promotion_map , "promotion map")
    }
    copyBaselineGermany(){
        // console.log(this.product_week , )
        this.promotion_map = []
        // {"selected_promotion" : $event.value , "week" : this.product_week }
        this.product_week.forEach(data=>{
            // debugger

            let val = (parseFloat((data.tpr_discount).toString()))
            if(val){
                this.promotion_map.push({
                    "selected_promotion": utils.genratePromotionGermany(
                        parseFloat(data.tpr_discount),
                        parseFloat(data.flag_promotype_leaflet)
                        ,parseFloat(data.flag_promotype_display),parseFloat(data.flag_promotype_distribution_500),
                        // ,parseFloat(data.co_investment)
                    ),
                    // "TPR-"+val+"%",
                    "week" : data})

                // //console.log(val , "values fro ", data.week , " discont " ,  "TPR-"+val+"%")
            }
            data.promo_depth = val
            // data.promo_depth = val
            data.base_promo_price = data.median_base_price_log

            var number =utils.reducePercent(data.base_promo_price , val)
            data.promo_price = Number(number.toFixed(2))
            // data.co_investment = (parseFloat((data.co_investment).toString()))
            // promo_depth.map(val=>"TPR-"+val+"%")
        })
        //console.log(this.promotion_map , "promotion map change")


        // debugger


    }
    copyBaselineUK(){
        // console.log(this.product_week , )
        this.promotion_map = []
        // {"selected_promotion" : $event.value , "week" : this.product_week }
        this.product_week.forEach(data=>{
            if(data.base_tactics){
                if(data?.promo_mechanic_2){
                    this.promotion_map.push({
                        "selected_promotion":  utils.genratePromotionUK(
                            data.promo_mechanic_2,data.tpr_discount , data.flag_promotype_display_ge ,
                            data.flag_promotype_display_ss , data.flag_promotype_pl,data.flag_promotype_poweraisle,
                            data.flag_promotype_consumer_promotions,data
                                    ),
                        // "TPR-"+val+"%",
                        "week" : data})
                }else{
                    this.promotion_map.push({
                        "selected_promotion":  utils.genratePromotionUK(
                            data.base_tactics,data.tpr_discount , data.flag_promotype_display_ge ,
                            data.flag_promotype_display_ss , data.flag_promotype_pl,data.flag_promotype_poweraisle,
                            data.flag_promotype_consumer_promotions,data
                                    ),
                        // "TPR-"+val+"%",
                        "week" : data})
                }
                

                // //console.log(val , "values fro ", data.week , " discont " ,  "TPR-"+val+"%")


            }

            // debugger
            data.base_promo_price = data.median_base_price_log
            var number = this.promoService.getPromoPrice(data.base_tactics)
            number = Number(parseFloat(number).toFixed(2))
            // var number = parseFloat(data.base_tactics.match(/[\d\.]+/))
            data.promo_price = number
            data.units_in_promotion = this.promoService.getUnitsSoldOnPromotion(data.base_tactics)
            // data.co_investment = (parseFloat((data.co_investment).toString()))
            // promo_depth.map(val=>"TPR-"+val+"%")
        })
        //console.log(this.promotion_map , "promotion map change")


        // debugger

    }
    copyBaseline(){
        if(this.tenant == 'france'){
this.copyBaselineUK()
        }
        else{
this.copyBaselineGermany()
        }

    }

    copyBaselineBKP(){
        // console.log(this.product_week , )
        this.promotion_map = []
        // {"selected_promotion" : $event.value , "week" : this.product_week }
        this.product_week.forEach(data=>{
            // debugger

            let val = (parseFloat((data.promo_depth).toString()))
            if(val){
                this.promotion_map.push({
                    "selected_promotion": utils.genratePromotion(
                        parseFloat(data.flag_promotype_motivation)
                        ,parseFloat(data.flag_promotype_n_pls_1),parseFloat(data.flag_promotype_traffic),
                        parseFloat(data.promo_depth),parseFloat(data.co_investment)
                    ),
                    // "TPR-"+val+"%",
                    "week" : data})

                // //console.log(val , "values fro ", data.week , " discont " ,  "TPR-"+val+"%")
            }
            data.promo_depth = val
            data.promo_depth = val
            data.co_investment = (parseFloat((data.co_investment).toString()))
            // promo_depth.map(val=>"TPR-"+val+"%")
        })
        //console.log(this.promotion_map , "promotion map change")


        // debugger
    }

    changeYear(){
        let y2 = ['Y2 Q1','Y2 Q2','Y2 Q3','Y2 Q4']
        let y3 = ['Y3 Q1','Y3 Q2','Y3 Q3','Y3 Q4']
        //console.log(this.singleSelect , "single selecct")
        if(this.singleSelect == "2 years"){
            // debugger
            this.quarter_year = [...this.quarter_year , ...y2]
            this.quarter_year = this.quarter_year.filter(e=>!y3.includes(e))
            this.quarter_year =[...new Set(this.quarter_year)]
            return
        }
        if(this.singleSelect == "3 years"){
            this.quarter_year = [...this.quarter_year , ...y2 , ...y3]
            this.quarter_year =[...new Set(this.quarter_year)]
            return
        }
        this.quarter_year = this.quarter_year.filter(e=>(!y3.includes(e) && (!y2.includes(e))))
        this.quarter_year =[...new Set(this.quarter_year)]
        //console.log(this.quarter_year , "quarter year")
    }
    changeQuarter(key:string){
        if(key.includes("Y2") || key.includes("Y3")){
            this.toastr.warning("Only one year data available")
            return
        }

        // debugger
        this.selected_quarter = key
        this.selected_product_week  = this.product_week.filter(data=>data.quater == parseInt(
            this.selected_quarter.split("Q")[1]
            )
            ).sort((a,b)=>(a.week > b.week) ? 1 : ((b.week > a.week) ? -1 : 0))
    }

    simulateAndReset(type){
        //console.log(this.promo_elasticity , "promo elasticity")
        //console.log(this.disable_button , "hiding panel")
        if(!this.disable_button){
            this.simulateResetEvent.emit({
                "action" : type,
                "promotion_map" : this.promotion_map,
                "promo_elasticity" : this.promo_elasticity
            })

        }
        return


    }

    sendMessage(modalType: string): void {
        this.isShowDivIf = true
        if(modalType == 'save-scenario-popup'){
            if(this.disable_button){
                return
            }
        }
        this.modalEvent.emit(modalType);
    }
    download(){
        if(this.disable_button){
            return
        }
        this.downloadEvent.emit()

    }

    isShowDivIf = true;

    toggleDisplayDivIf() {
        this.isShowDivIf = !this.isShowDivIf;
    }

    singleSelect: any = [];
    config = {
        displayKey: 'name', // if objects array passed which key to be displayed defaults to description
        search: false,
        placeholder:'Time period'
    };
    optionsNormal = [
        {
            _id: '3years',
            index: 0,
            balance: '$2,806.37',
            picture: 'http://placehold.it/32x32',
            name: '3 years',
        },
        {
            _id: '1year',
            index: 1,
            balance: '$2,984.98',
            picture: 'http://placehold.it/32x32',
            name: '1 years',
        },
        {
            _id: '2year',
            index: 1,
            balance: '$2,984.98',
            picture: 'http://placehold.it/32x32',
            name: '2 years',
        },
    ];



    // options1 = [
    //     {
    //         _id: 'N230%(Co30%)',
    //         index: 0,
    //         name: 'N+2-30% (Co-30%)',
    //     },
    //     {
    //         _id: 'N230%(Co30%)s',
    //         index: 1,
    //         name: 'N+2-30% (Co-30%)',
    //     },
    //     {
    //         _id: 'N230%(Co30%)a',
    //         index: 1,
    //         name: 'N+2-30% (Co-30%)',
    //     },
    // ];
    options2 = [
        {
            _id: 'N230%(Co30%)1',
            index: 0,
            name: 'N+2-30% (Co-30%)1',
        },
        {
            _id: 'N230%(Co30%)s2',
            index: 1,
            name: 'N+2-30% (Co-30%)2',
        },
        {
            _id: 'N230%(Co30%)a3',
            index: 1,
            name: 'N+2-30% (Co-30%)3',
        },
    ];
    options3 = [
        {
            _id: 'N230%(Co30%)2',
            index: 0,
            name: 'N+2-30% (Co-30%)2',
        },
        {
            _id: 'N230%(Co30%)s2',
            index: 1,
            name: 'N+2-30% (Co-30%)4',
        },
        {
            _id: 'N230%(Co30%)a3',
            index: 1,
            name: 'N+2-30% (Co-30%)3',
        },
    ];

    ngOnDestroy(){
        //console.log("destroying sceario header")
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
    ngOnChanges(changes: SimpleChanges) {

        for (let property in changes) {
            if (property === 'hidepanel') {

                this.hidepanel = changes[property].currentValue

            }
            if (property === 'title') {

                this.title = changes[property].currentValue




            }
        }
    }
    downloadUserGuild(){
        let link = document.createElement('a');
        link.setAttribute('type', 'hidden');
        link.href = '/assets/user-guide/simulator/Updated User Guide Pictures.pptx';
        link.download = "france_simulator_userguide";
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}
