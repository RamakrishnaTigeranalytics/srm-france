import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import {OptimizerService, PromotionService, SimulatorService} from '@core/services'
import {CheckboxModel, TacticsModel} from '@core/models'
import { ModalService } from '@molecules/modal/modal.service';
import * as Utils from "@core/utils"
import * as $ from 'jquery';
import { ToastrService } from 'ngx-toastr';
import {Subject} from 'rxjs';
import {takeUntil} from "rxjs/operators"
// import { tickStep } from 'd3-array';
const MUTLIBUY_KEY = 'Multibuy'
const TPR_KEY = 'TPR'
const TPR_MULTIBUY_KEY = 'TPR + Multibuy'
const DISPLAY_KEY = 'Display'
const CP_KEY = 'Consumer Promotions'
const CUSTOM_KEY = 'Custom'
@Component({
    selector: 'nwn-promotion-details',
    templateUrl: './promotion-details.component.html',
    styleUrls: ['./promotion-details.component.css'],
})
export class PromotionDetailsComponent implements OnInit {
    private LEVEL_ONE_PROMO_KEY   = [MUTLIBUY_KEY , TPR_KEY,TPR_MULTIBUY_KEY, CUSTOM_KEY]
    private DISPLAY_KEY = DISPLAY_KEY
    private CP_KEY = CP_KEY
    CUSTOM_KEY = CUSTOM_KEY
    promo_name:any[] = []
    promo_name2:any[] = []
    display_keys:CheckboxModel[] = []
    is_consumer_promotion = false
    tactics_data : TacticsModel[]
    disable_level_two = true
    show_custom = false
    selected_display:any[] = []

    private LEVEL_TWO_MAP = {}
    generated_promotion = '';
    percentageVolume = 0;
    errMsg:any = {
        mechanic: false,
        discount: false,
        co_investment: false
    }
    promotionSwitch: false;
    promo_value_1 = '';

    @Output()
    promotionAddEvent = new EventEmitter()

    @Output()
    customData = new EventEmitter()

    constructor(private toastr: ToastrService,private optimize : OptimizerService,
                public modalService: ModalService,public restApi: SimulatorService,
                private promotionService : PromotionService,
    ){

    }
    private unsubscribe$: Subject<any> = new Subject<any>();
    config:any = {
        displayKey: 'name', // if objects array passed which key to be displayed defaults to description
        search: true
    };
    promo_generated = ''
    input_promotions:Array<CheckboxModel> = []
    base_line_promotions:Array<CheckboxModel> = []
    history_baseline:Array<any> = []

    form = new FormGroup({
        promo_level_one: new FormControl('', []),
        promo_level_two: new FormControl('', []),
        display : new FormControl([],[]),
        cp : new FormControl(false , []),
        multibuy_split_1 :new FormControl(0, []),
        multibuy_split_2 :new FormControl(0.0, []),
        promo_price : new FormControl(0, []),
        custom_promo_name : new FormControl('' , []),
        generated_promo : new FormControl('',[])
    });
    @Input()
    valueDiscountdepth = 0;

    @Input()
    currency;

    @Input()
    isLeafletShow;

    @Input()
    isDisplayShow;

    @Input()
    valueCoInvestment = 0;

    @Input()
    discountdepth: Options = {
        floor: 0,
        ceil: 100,
        showSelectionBar: true,
        disabled: true,
        translate: (value: number, label: LabelType): string => {
            if(value!=100){
                // this.form.controls['tpr'].setValue(value);

            }

            switch (label) {
                case LabelType.Ceil:
                    return value + ' %';
                case LabelType.Floor:
                    return value + ' %';
                default:
                    return '' + value;
            }
        },
    };
    coInvestment: Options = {
        floor: 0,
        ceil: 100,
        showSelectionBar: true,
        disabled: true,
        translate: (value: number, label: LabelType): string => {
            if(value!=100){
                // this.form.controls['co_inv'].setValue(value);

            }


            switch (label) {
                case LabelType.Ceil:
                    return value + ' %';
                case LabelType.Floor:
                    return value + ' %';
                default:
                    return '' + value;
            }
        },
    };
    options: Options = {
        floor: 0,
        ceil: 100,
        step: 1,
        minLimit: 0,
        maxLimit: 100
    }

    customPromo: any = [];
    get f(){
        return this.form.controls;
    }

    // ngOnInit(): void {
    //     this.config = {
    //         displayKey: 'name', // if objects array passed which key to be displayed defaults to description
    //         search: true,
    //     };
    //     // console.log(this.base_promotions , "base promotions")
    //     this.form.valueChanges.subscribe(data=>{
    //         // console.log(data , "form changes subscription")
    //         // let promo = null
    //         let final = Utils.genratePromotion(
    //             data.promo == "Motivation" ? 1 : 0,
    //             data.promo == "N+1" ? 1 : 0,
    //             data.promo == "Traffic" ? 1 : 0,
    //          data.tpr,
    //          data.co_inv
    //         )
    //              setTimeout(()=>{
    //             this.promo_generated = final
    //             console.log(final , "final value")
        
    //         },500)
            
    //         // console.log(name , "name of label")
             
    //     })
    // }
    ngOnInit(){
        this.optimize.getBaseLineObservable().pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(data=>{
            // this.base_line_promotions = data
            this.base_line_promotions = data.map(e=>({"value" : e,"checked" : false}))
            this.input_promotions = []
            console.log(this.base_line_promotions , "base line promotions France")
        })

        this.promotionService.getTactics().pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(data=>{
            if(data){
                this.tactics_data = data
                console.log(this.tactics_data , "tactics_datatactics_datatactics_data")
                this._generatePromotionVariables()
                console.log(this.promo_name , "level one result")

            }


        })

        this.restApi.ClearScearchText.asObservable().pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(data=>{
            if(data == "add-promotion"){

                this.valueCoInvestment = 0
                this.valueDiscountdepth = 0
                this.form.reset()
                this.show_custom = false;
            }


        })
        
        //   setTimeout(()=>{

        //     },500)
        this.config = {
            displayKey: 'name', // if objects array passed which key to be displayed defaults to description
            // search: true,
        };
        // this.form.valueChanges.subscribe(data=>{

        // let final = Utils.genratePromotion(
        //     data.promo == "Motivation" ? 1 : 0,
        //     data.promo == "N+1" ? 1 : 0,
        //     data.promo == "Traffic" ? 1 : 0,
        //  data.tpr,
        //  data.co_inv
        // )
        // setTimeout(()=>{
        //     this.base_line_promotions = this.optimize.get_base_line_promotions().map(e=>({"value" : e,"checked" : false}))
        //     this.promo_name = this.optimize.get_base_line_promotions().map(e=>Utils.decodePromotion(e)['promo_mechanics'])
        //     this.promo_name = [...new Set(this.promo_name.map(item => item))]
        //     //console.log(this.base_line_promotions , "base line promotions")
        //     },100)
        //      setTimeout(()=>{

        //     this.promo_generated = final
        //     //console.log(this.promo_generated , "this.promo_generated this.promo_generated ")

        // },500)
        // })
    }

    _generatePromotionVariables(){
        this.promo_name = []
        this.promo_name2 = []
        this.display_keys = []


        this.tactics_data.forEach(data=>{
            this._generate_level_one_promo(data)
            this._generate_level_two_promo(data)
            this._generate_display_cp_checkbox(data)



        })

    }
    
    _generate_level_one_promo(data : TacticsModel){

        if(this.LEVEL_ONE_PROMO_KEY.includes(data.promo_mechanic_1) &&
            !this.promo_name.includes(data.promo_mechanic_1)){
            // this.promo_name.push(data.promo_mechanic_1)
            this.promo_name = [...this.promo_name , data.promo_mechanic_1]
        }

    }
    _generate_level_two_promo(data : TacticsModel){
        // this.LEVEL_TWO_MAP = {}
        // debugger
        if(
            (data.promo_mechanic_1 in this.LEVEL_TWO_MAP) &&
            this.LEVEL_ONE_PROMO_KEY.includes(data.promo_mechanic_1)
        )
        {
            if(!this.LEVEL_TWO_MAP[data.promo_mechanic_1].includes(data.promo_mechanic_2)){
                this.LEVEL_TWO_MAP[data.promo_mechanic_1].push(data.promo_mechanic_2)
            }



        }
        else if (
            (!(data.promo_mechanic_1 in this.LEVEL_TWO_MAP)) &&
            this.LEVEL_ONE_PROMO_KEY.includes(data.promo_mechanic_1)
        ){
            this.LEVEL_TWO_MAP[data.promo_mechanic_1] = [data.promo_mechanic_2]

        }

    }
    _generate_display_cp_checkbox(data:TacticsModel){
        this.display_keys = [{"value" : data.promo_mechanic_2 , "checked" : false}]
        if(this.CP_KEY == data.promo_mechanic_1){
            this.is_consumer_promotion = true
        }
        console.log(this.display_keys, ":this.display_keys");
    }
    // valueChangePromo($event){
    //     // debugger
    //     if($event['checked']){
    //         this.selected_promotions.push($event['value'])
    //     }
    //     else{
    //         this.selected_promotions = this.selected_promotions.filter(d=>d!=$event['value'])

    //     }
    //     // value: "TPR-15%", checked: false
    //     // console.log($event , "value change event")
    //     // let promo = this.input_promotions.find(d=>d.value == $event['value'])

    //     // let checked = promo?.checked
    //     // if(checked){
    //     //     // promo.checked = !checked
    //     // }
       
    //     // console.log(this.input_promotions , "input prmotions ")
    // }
    // clickClosedEvent($event){
    //     // TPR-15% close event
    //     console.log($event , "close event")
    // }
    // apply(){
    //     if(this.selected_promotions.length > 0){
    //         this.promotionAddEvent.emit({
    //             "id" : "promotion-details",
    //             "value" : this.selected_promotions
    //         })
    //     }
    //     else {
    //         this.toastr.error("Please select atleast one promotion")
    //     }
    // }
    applyPromotion(){
        let data: any = [];
        let promotionNames:any = [];

        if(this.input_promotions.length > 0){
            this.input_promotions.map((item) => {
                if (item.checked) {
                    this.customPromo.map(promo => {
                        if (promo.generatedName === item.value) {
                            data.push(promo)
                        }
                    })
                }
            })
            data.forEach(a=>{
                promotionNames.push(a.generatedName);

            })
            this.promotionAddEvent.emit({
                "id" : "promotion-details",
                "value" : promotionNames,
                "promo_details":data,
                "tactics":this.tactics_data
            })
            let val = this.input_promotions.filter(a=>a.checked).map(e=>e.value)
            //console.log(val , "val genetratefd")
            this.optimize.setPromotionObservable(val)
            //console.log(this.input_promotions , "input promotions ")
            var modal_id:any = this.modalService.opened_modal
            if(modal_id.length > 0){
                modal_id = modal_id[modal_id.length-1]
                // $('#'+modal_id).hide();
                this.modalService.close(modal_id)
                this.restApi.setClearScearchTextObservable(modal_id)
            }
        }
        else{
            this.modalService.close('add-promotion')
            // this.toastr.error("Please select atleast one promotion")
        }
    }
    addPromotions(){
        // form_values

        let form_values = this.form.value
        if(form_values['promo_level_one'] == MUTLIBUY_KEY){
            if(form_values['promo_level_two'] == CUSTOM_KEY){
                let tactic = {
                    "model_meta" : 0,
                    "promo_mechanic_1" : form_values['promo_level_one'],
                    "promo_mechanic_2" : form_values['multibuy_split_2'] + "/" + this.currency + form_values['multibuy_split_1'],
                    "promo_price" : form_values['promo_price'],
                    "percentage_volume" : form_values['percentage_volume']
                }
                console.log(tactic , "tactic gemenrations")
                this.promotionService.addTactics(tactic)

            }
        }
        else if(form_values['promo_level_one'] == TPR_KEY){
            if(form_values['promo_level_two'] == CUSTOM_KEY){
                let tactic = {
                    "model_meta" : 0,
                    "promo_mechanic_1" : form_values['promo_level_one'],
                    "promo_mechanic_2" : this.currency + form_values['promo_price'],
                    "promo_price" : form_values['promo_price'],
                    "percentage_volume" : form_values['percentage_volume']
                }
                console.log(tactic , "tactic gemenrations")
                this.promotionService.addTactics(tactic)

            }
        }

        // debugger
        // if(this.form.value.promo != ""){
        //     if(Object.prototype.toString.call(this.form.value.promo).slice(8, -1).toLowerCase() == 'array'){
        //         this.errMsg.mechanic = true
        //         return
        //     }
        // }
        // else if(this.form.value.promo == ""){
        //     this.errMsg.mechanic = true
        //     return
        // }

        // if((this.form.value.tpr == 0 || this.form.value.tpr == null) && (this.form.value.co_inv == 0 || this.form.value.co_inv == null)){
        //     this.errMsg.discount = true
        //     return
        // }

        // if(this.form.value.co_inv == 0 || this.form.value.co_inv == null){
        //     this.errMsg.co_investment = true
        //     return
        // }
        var gen_promo = this.form.value['generated_promo']
        if(gen_promo){
            if(!this.input_promotions.find(v=>v.value == gen_promo)){
                this.input_promotions.push({"value" : gen_promo , "checked" : false})
            }
            // if(this.promo_generated){
            // if(!this.input_promotions.find(v=>v.value == this.promo_generated)){
            //     this.input_promotions.push({"value" : this.promo_generated , "checked" : false})
            // }
            // }

            // this.valueCoInvestment = 0
            // this.valueDiscountdepth = 0
            this.form.reset()
            this.selected_display = []
            this.display_keys = this.display_keys.map(a => {
                var returnValue = {...a , ...{"checked" : false}};

                return returnValue
            })
            console.log(this.display_keys , "display keys..")
            this.errMsg.mechanic = false
            this.errMsg.discount = false
            this.errMsg.co_investment = false
            this.show_custom = false


        }
        this.customPromo.push({
            promo_mechanic_1: this.promo_value_1,
            units_in_promotion: this.percentageVolume,
            generatedName: this.generated_promotion
        })

        // //console.log(this.promo_generated , "promotion generated")
    }
    clickClosedEvent($event){
        // debugger
        //console.log($event , "click closed event")
        // debugger
        // let val = parseInt($event.replace(/[^0-9]/g,''))
        //console.log($event , "click closed")
        //console.log(this.history_baseline , "history baseline")
        if(this.history_baseline.includes($event)){
            this.base_line_promotions.push({"value" : $event,"checked" : false})
            this.input_promotions = this.input_promotions.filter(val=>val.value!=$event)
        }
        else{
            this.input_promotions = this.input_promotions.filter(val=>val.value!=$event)

        }
        // ignoreElements()
    }
    hideNoResultsFound(){
        $( "#promo-details1" ).click(function() {
           let temp:any =  $(".available-items").text();
           if(temp == "No results found!"){
            $(".available-items").hide()
           }
           else {
            $(".available-items").show()
           }
        })
    }
    // ngOnChanges(changes: SimpleChanges) {
        
    //            for (let property in changes) {
    //                if (property === 'base_promotions') {
    //                    this.input_promotions = []
    //                    this.selected_promotions = []
                      
    //                    // console.log(changes[property].currentValue , "current value")
    //                    this.base_promotions = changes[property].currentValue
    //                    if(this.base_promotions.length > 0){
    //                     setTimeout(()=>{
    //                         this.optionsNormal = this.base_promotions.map(e=> Utils.decodePromotion(e)['promo_mechanics'])
    //                         this.optionsNormal = [...new Set(this.optionsNormal.map(item => item))]
                
    //                     },0)
                      

    //                    }
                      
                       
    //                    this.input_promotions = this.base_promotions.map(e=>({
    //                        "value" : e,"checked" : false
    //                    }))
                        
                      
    //                } 
                   
    //            }
    //        }
    // changePromotion(e:any){
    //     if(e.value.length == 0){
    //         this.coInvestment = Object.assign({}, this.coInvestment, {disabled: true})
    //     this.discountdepth = Object.assign({}, this.discountdepth, {disabled: true});
    //     this.valueDiscountdepth = 0
    //     this.valueCoInvestment = 0

    //     }
    //     else{
    //         this.coInvestment = Object.assign({}, this.coInvestment, {disabled: false})
    //     this.discountdepth = Object.assign({}, this.discountdepth, {disabled: false});

    //     }
    //     this.errMsg.mechanic = false
    //     this.form.controls['promo'].setValue(e.value);
    //     console.log(e.value , "selected value");
    //     console.log(this.form.value , "fomr value")
    // }
    sliderEvent(){
        this.errMsg.discount = false
    }
    changeLevelOnePromotion(e:any){
        this.show_custom = false
        this.generated_promotion = ''
        // this.form.patchValue({

        // })
        this.form.patchValue({
            "promo_level_two" : '',
            "generated_promo" : ''
        })
        if (e.value == this.CUSTOM_KEY) {
            this.show_custom = true;
        }
        this.promo_name2 = []
        // if(e.value == TPR_MULTIBUY_KEY){
        //     this.promo_name2 = []
        // }
        // else{
        //     this.promo_name2 = [this.CUSTOM_KEY]
        //
        // }

        console.log(e , "level one promotion")
        if(typeof e.value == 'string'){
            this.promo_value_1 = e.value;
            this.disable_level_two = false
            this.promo_name2 = [...this.promo_name2 , ...this.LEVEL_TWO_MAP[e.value]]
            console.log(this.promo_name2 , "level two promo..")
        }
    }
    onInputChange(e){
        // let ip = e.target.value
        this._generate_form_promotion()

    }
    changePromotion(e:any){
        this.generated_promotion = ''
        this.form.patchValue({
            "generated_promo" : ''
        })
        if(e.value){
            // this.generated_promotion += e.value
            this._generate_form_promotion()

        }
        //console.log(e.value.length , "lenth of sselscted promotion")
        // if(e.value.length == 0){
        //     this.coInvestment = Object.assign({}, this.coInvestment, {disabled: true})
        // this.discountdepth = Object.assign({}, this.discountdepth, {disabled: true});
        // this.valueDiscountdepth = 0
        // this.valueCoInvestment = 0

        // }
        // else{
        //     this.coInvestment = Object.assign({}, this.coInvestment, {disabled: false})
        // this.discountdepth = Object.assign({}, this.discountdepth, {disabled: false});

        // }
        // this.errMsg.mechanic = false
        // this.form.controls['promo'].setValue(e.value);

        //console.log(e.value , "selected value");
        //console.log(this.form.value , "fomr value")
    }
    _generate_form_promotion(){
        this.generated_promotion = ''
        let form_values = this.form.value
        console.log(form_values , "from values")
        let level_one = form_values['promo_level_one']
        let level_two = form_values['promo_level_two']
        let joint_display = form_values['display']

        if(level_one == MUTLIBUY_KEY){
            this.generated_promotion += level_two
            // if (this.promotionSwitch) {
            //     this.generated_promotion += `+pp-${this.currency}${form_values['promo_price']}+pv-${this.percentageVolume}`
            // } else {
            //     this.generated_promotion += `+tpr-${form_values['promo_price']}%+pv-${this.percentageVolume}`
            // }
            // this.generated_promotion += this.currency+form_values['custom_promo_name']
            if(joint_display && joint_display.length>0){
                joint_display= joint_display.join("+")
                this.generated_promotion += "+" + joint_display

            }

            if(form_values['cp']){
                this.generated_promotion += "+Leaflet"
            }
        }
        else if(level_one == CUSTOM_KEY){
            this.generated_promotion += `Custom+${level_two}`;
            if(joint_display && joint_display.length>0){
                joint_display= joint_display.join("+")
                this.generated_promotion += "+" + joint_display

            }

            if(form_values['cp']){
                this.generated_promotion += "+Leaflet"
            }
            if (this.promotionSwitch) {
                form_values['promo_price'] && (this.generated_promotion += ` - ${this.currency}${form_values['promo_price']}`)
            } else {
                form_values['promo_price'] && (this.generated_promotion += ` - ${form_values['promo_price']}%`)
            }

        }
        else{
            this.generated_promotion += this.show_custom ? `Custom+${level_two}` : level_two;
        }

        // console.log(this.form.value , "current form values")
        console.log(this.generated_promotion , "generated promotion")
        console.log(joint_display , "joint disaply")
        this.form.patchValue({
            "generated_promo" : this.generated_promotion
        })
    }
    changeSwitch(event) {
        this.promotionSwitch = event;
        this._generate_form_promotion()
    }
    sliderChangeEvent(e: any) {
        this.percentageVolume = e.value;
        this._generate_form_promotion();
    }
    valueChangeDisplay(e){

        if(e.checked){
            this.selected_display.push(e.value)
        }
        else{
            var idx = this.selected_display.findIndex(p =>p== e.value);
            this.selected_display.splice(idx,1);

        }
        this.form.patchValue({
            "display" : this.selected_display
        })

        console.log(e , "checkbox change...")
        this._generate_form_promotion()
        // console.log(e , "checkbox change...")
    }
    valueChangeCP(e){
        this.form.patchValue({
            "cp" :e.checked
        })

        this._generate_form_promotion()
    }
    valueChangeBaseline(e:any){
        let f = this.input_promotions.find(i=>i.value == e.value)
        if(!f){
            this.history_baseline.push(e.value)
            this.input_promotions.push({"value" : e.value, "checked" : e.checked})
            if (e.checked) {
                this.customPromo.push({
                    promo_mechanic_1: "",
                    generatedName: e.value,
                })
            } else {
                this.customPromo = this.customPromo.filter(item => item.generatedName !== e.value)
            }
            // //console.log(this.input_promotions , "input promotions ")
            // debugger
            this.base_line_promotions = this.base_line_promotions.filter(val=>val.value!=e.value)
            // this.base_line_promotions.indexOf()
            // //console.log(e.value , "base line promo value")
        }


    }
    valueChangePromo(e:any){
        // debugger
        //console.log(e.value , "promo value selected")
        // if(this.history_baseline.includes(e.value)){
        //     this.base_line_promotions.push({"value" : e.value,"checked" : false})
        //     this.input_promotions = this.input_promotions.filter(val=>val.value!=e.value)
        // }
        // else{
        //     this.input_promotions = this.input_promotions.filter(val=>val.value!=e.value)
        //
        // }
        this.input_promotions.forEach((a,i)=>{
            if(a.value == e.value){
                this.input_promotions[i].checked = e.checked;
            }
        })
    }
    
}

