import { Component, Output, EventEmitter, ViewChild, OnInit, Input,SimpleChanges, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import {takeUntil} from 'rxjs/operators'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CheckboxModel, ListPromotion, MetaInfo, PriceSimulated, PricingModel, PricingPromoModel,User } from '@core/models';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ModalService } from '@molecules/modal/modal.service';
import {PricingService,OptimizerService,AuthService} from "@core/services"
import { ToastrService } from 'ngx-toastr';
import * as $ from 'jquery';

// import {FlatTreeControl} from "@angular/cdk/tree"
import {MatAccordion} from '@angular/material/expansion';
import * as FileSaver from 'file-saver';
import * as utils from "@core/utils"

import {DatePickerComponent} from 'ng2-date-picker';
import * as moment from 'moment';



@Component({
    selector: 'nwn-loaded-pricing-scenario-header',
    templateUrl: './loaded-pricing-scenario-header.component.html',
    styleUrls: ['./loaded-pricing-scenario-header.component.css'],
})
export class LoadedPricingScenarioHeaderComponent implements OnInit , OnDestroy {
    private readonly destroy$ = new Subject();
    @Input()
    currency = ""
    @Input()
    outerClick;
    user : User = (null as any)

    is_admin = false
    disable_per_unit_promo = true

    derived = "78.23€"
    base = "23.34€"
    abs = false
    datePickerConfig = {
        min : '1-1-2022',
        max : '31-12-2022'
    }
    rets = ['Orbit OTC' ]
    panels = ["Tander" , "Lenta" , "Pyatraochka"]
    disable_button = false
    disable_save_download = true
    @ViewChild(MatAccordion) accordion: MatAccordion;
    @ViewChild('dayPicker') datePicker: DatePickerComponent;
    step = 0;
    uploaded_file:any = null
    mindate = "01-01-2022"
    tenant
    price_simulated : PriceSimulated  = null as any
    checkedInternal: boolean = false;
    checkedExternal: boolean=false;
    popupExternalCheck: boolean = false;
    popupInternalCheck: boolean = false;

    open(element) {
        // console.log(element , "");
        (element as DatePickerComponent).api.open()

    }
    close() { this.datePicker.api.close(); }

    // detectChange($event){
    //     this.abs = $event.checked
    // }



  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }


    selectedIndex!: number;
    treemode = false





    constructor( private formBuilder: FormBuilder,
        private toastr: ToastrService,private pricingService : PricingService ,
        private modalService: ModalService,
        private optimizeService : OptimizerService,
        private  authService : AuthService) {

        this.pricingForm = this.formBuilder.group({
            // e.account_name  :new FormGroup({
            products : this.formBuilder.array([])
        // })

    })
    this.lenta  = this.pricingForm.get('products') as FormArray

}
    @Input()
    pricingArray : PricingModel[] = []
   


    @Input()
    count_ret : any
    @Input()
    showtbas= false
    unique_retailers : any[] = []
    lpi = 0
    rsp = 0
    cogs = 0
    elasticity = 0
    currentProduct:any = null
    currentProductGroup:CheckboxModel[] = []
    pricingForm : FormGroup
    lenta : FormArray
    selected_main_product : string;
    selected_sub_product : string;
    displayProduct:any[]= []
    ret = ['abc']
    chosen_promotion : ListPromotion = null as any
    applyAllMetric = "List Price"
    date_form = {
        "index" : null,
        "metric_type" : null
    }


    addRet(){
        this.ret = [...this.ret , 'abd']
        this.getTabLength()
    }

    @Output()
    modalEvent = new EventEmitter<string>();

    @Output()
    simulateResetEvent = new EventEmitter<any>()

    @Output()
    loadScenarioEvent = new EventEmitter<any>()

    @Output()
    removeRetailerEvent = new EventEmitter()

    @Output()
    uploadFormUpdateEvent = new EventEmitter()

    selectedDate;



    removeProductEvent(index , retailer){
       // console.log(index , "event")
       // console.log(retailer , "product of")
       // console.log(this.lenta.value , "array values")
        this.removeRetailerEvent.emit({
            "product" : {
                "retailer" : retailer,
                "product" : this.lenta.value[index]["product_group"]
            }
        })
    }
    removeRetailer(retailer){
        this.removeRetailerEvent.emit({
            "retailer" : {
                "retailer" : retailer,

            }
        })

    }
    closeModal($event){
        this.uploadFile()
        this.modalService.close($event)
    }
    downloadWeekly(){
        let form  = {...this.pricingForm.value , ...{"is_abs" : this.abs}}
        this.pricingService.downloadPricingWeekly(form).subscribe(data=>{
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            //// console.log(data , "download api called and returned...")
            this.toastr.success('File Downloaded Successfully','Success');
            FileSaver.saveAs(
                blob,
                'pricingbulk_'+this.tenant+ "_" + String(this.abs)  + '_download_' + new Date().getTime() + 'xlsx'
                )
                ,(err:any)=>{
                    this.toastr.warning(err.error,'Failed');
                }
        })
    }

    downloadPricing(){
        if(this.disable_save_download){
            return
        }
        this.pricingService.downloadPricing().subscribe(data=>{
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
           // console.log(data , "download api called and returned...")
            this.toastr.success('File Downloaded Successfully','Success');
            FileSaver.saveAs(
                blob,
                'pricing' + '_export_' + new Date().getTime() + 'xlsx'
                )
                ,(err:any)=>{
                    this.toastr.warning(err.error,'Failed');
                }
        })
    }
    isExist = false
    savedFormDetails :any;
    dataSuccess= false;
    conformSave(event){
        if(event == 'yes'){
            this.modalService.close('save-scenario-conform');
            if(this.savedFormDetails['type'] == "saveas"){
                this.savedFormDetails['name']
                this.savedFormDetails['comments']
                this.pricingForm.value.products.map((item) => {
                    item.corporate_segment = item.product_group.split(' - ')[0];
                    item.brand = item.product_group.split(' - ')[1];
                })
                let form = {
                    "name" :this.savedFormDetails['name'],
                    "comments" : this.savedFormDetails["comments"],
                    'value':this.pricingForm.value,
                    'result' : this.price_simulated


                }


        this.pricingService.savePricingScenario(form).subscribe(data=>{
            if(data){
                // debugger
                this.dataSuccess = true;
                this.toastr.success('Scenario Saved Successfully','Success')
                this.modalService.close('save-scenario')
                let promotion : ListPromotion = {
                    "id" : data['saved_id'],
                    "name" : this.savedFormDetails['name'],
                    "comments" : this.savedFormDetails['comments'],
                    "scenario_type" : "pricing",
                "meta" : this.getMetaArray(this.pricingForm.value),
                "user" : this.user.user,
                "created_at" : new Date()

                }

               this.chosen_promotion = promotion

                this.optimizeService.addPromotionList(promotion)

            }

        },(error=>{
            if(error.status_code == 400){
                this.toastr.error(error.detail)
            }
        }))
    // }


            }
          //  this.isExist = false;
        }else{
            this.modalService.close('save-scenario-conform');
            this.sendMessage('save-scenario');
        }
    }

    saveScenario($event){
        this.savedFormDetails = $event;
        this.isExist = false;
        // console.log(this.pricingForm.value , "....pricing from value....")
        if($event['type'] == "saveas"){
            $event['name']
            $event['comments']
            this.pricingForm.value.products.map((item) => {
                item.corporate_segment = item.product_group.split(' - ')[0];
                item.brand = item.product_group.split(' - ')[1];
                delete item.internal_competition;
                delete item.external_competition;
            })
            let form = {
                "name" : $event['name'],
                "comments" : $event["comments"],
                'value':this.pricingForm.value,
                'result' : this.price_simulated
            }

            this.optimizeService.getListObservation().subscribe(data=>{
                data.forEach((a:any)=>{
                    if((a.user.email == this.user.user.email) && (a.name == $event['name'])){
                        if(!this.dataSuccess){
                            this.modalService.close('save-scenario');
                            // this.sendMessage('save-scenario-conform');
                            this.isExist = true;
                            return
                        }

                    }else{

                    }
                })
            })

// if(!this.isExist){
            this.pricingService.savePricingScenario(form).subscribe(data=>{
                if(data){

                    this.toastr.success('Scenario Saved Successfully','Success')
                    this.dataSuccess = true;
                    this.modalService.close('save-scenario')
                    let promotion : ListPromotion = {
                        "id" : data['saved_id'],
                        "name" : $event['name'],
                        "comments" : $event['comments'],
                        "scenario_type" : "pricing",
                        "meta" : this.getMetaArray(this.pricingForm.value),
                        "user" : this.user.user,
                        "created_at" : new Date()

                    }

                    this.chosen_promotion = promotion

                    this.optimizeService.addPromotionList(promotion)

                }

            },(error=>{
                if(error.status_code == 400){
                    this.toastr.error(error.message)
                }
            }))
        }


        //   }


    }

    getMetaArray(pricing_form){
       // console.log(pricing_form , "pricing form")

        let res:any= []
        pricing_form['products'].forEach(element => {
            res.push({
                "retailer" : element.account_name,
                "product_group" : element.product_group,

                "pricing" : {
                    "cogs_date" : element.cogs_date,
                    "list_price_date" : element.list_price_date,
                    "rsp_date": element.rsp_date,
                    "nsv_date" : element.nsv_date,
                    "promo_date" : element.promo_date,
                    "base_lpi" : element.list_price,
                    "base_rsp" : element.rsp,
                    "base_cogs" : element.cogs ,
                    "base_promo" : element.promo_price,
                    "base_nsv" : element.nsv_per_kg,

                    "lpi" : element.inc_list_price,
                    "rsp" : element.inc_rsp,
                    "cogs" : element.inc_cogs,
                    "promo" : element.inc_promo_price,
                    "nsv" : element.inc_nsv_per_kg,
                    "follow_competition" : element.follow_competition,
                    "internal_competition" : element.internal_competition,
                    "external_competition" : element.external_competition,
                    "inc_elasticity" : element.inc_elasticity,
                    "inc_net_elasticity":element.inc_net_elasticity,
                    "base_elasticity" : element.elasticity,
                    "base_net_elasticity":element.net_elasticity,
                    "is_tpr_constant":element.is_tpr_constant,

                    "internal" : element.internal,
                    "private" : element.private,
                }
            })

        });
        return res


    }
    isCheckBoxModel(check:CheckboxModel[] , val){
        return check.find(c=>c.value == val)?.checked

    }

    applyCloseEvent($event){

        //// console.log($event , "Event..")
        //// console.log(this.currentProduct , "current  retailer")
        // $event['metric']
        // $event['value']["date"]
        // $event['value']["applyElasticity"]

        // $event['products']
        let ctrl  :any;
        ctrl = this.lenta.controls.filter(d=>this.isCheckBoxModel( $event['products'], d.get('product_group')?.value))
        // let ctrl =  this.lenta.controls.filter(d=>(d.get('account_name')?.value == this.currentProduct))
        // ctrl = ctrl.filter(d=>this.isCheckBoxModel( $event['products'], d.get('product_group')?.value))
        // ctrl[0].controls.product_group.value
        ctrl.forEach(c=>{
            let patch = {}
            if($event['metric'] == 'Cogs'){
                //  patch['disable_cogs'] =  $event.checked

                patch['cogs_date'] = $event['value']["applyDate"]
                patch["inc_cogs"] =  $event['value']["applyElasticity"]

            }
            else if($event['metric'] == 'Shelf Price'){
                // debugger
                // let base = c.value['list_price']
                // let percent =
                patch['rsp_date'] = $event['value']["applyDate"]
                patch["inc_rsp"] =  $event['value']["applyElasticity"]            //  patch['disable_list_price'] =  $event.checked

            }else if($event['metric'] == 'NSV/Kg'){
                //  patch['disable_rsp'] =  $event.checked
                patch['nsv_date'] = $event['value']["applyDate"]
                patch["inc_nsv_per_kg"] =  $event['value']["applyElasticity"]

            }else if($event['metric'] == 'Elasticity'){
                patch['disable_elasticity'] =  $event.checked

            }else if($event['metric'] == 'Internal'){
                patch['internal_competition']=  $event['value']["applyInternal"]
                patch['internal']=  $event['value']["applyInternal"]

            }else if($event['metric'] == 'External'){
                patch['external_competition']=  $event['value']["applyExternal"]
                patch['private']=  $event['value']["applyExternal"]

            }
            else if($event['metric'] == 'Promo price'){
                // console.log($event , "promo price event")
                patch['promo_date'] = $event['value']["applyDate"]
                patch["inc_promo_price"] =  $event['value']["applyElasticity"]
                patch["is_tpr_constant"]  = $event["tpr_constant"]

            }
            c.patchValue(patch)


        })

        //// console.log(this.pricingForm.value , "ctrl vaues")
        this.modalService.close('apply-all-popup')

    }

    removeDate(index , v){
        let patch = {

        }
        if(v == 'list_price_date'){
            patch['list_price_date'] = null
        }
        else if(v == 'cogs_date'){
            patch['cogs_date'] = null
        }
        else if(v == 'rsp_date'){
            patch['rsp_date'] = null
        }
        else if(v == 'promo_date'){
            patch['nsv_date'] = null

        }

        // debugger
        this.lenta.at(index).patchValue(patch)

    }

    applyallOpen($event , product){
        // debugger
        //// console.log($event , "event")
        //// console.log(product , "product..")
        // debugger
        // this.currentProduct = product
        // this.currentProductGroup = [...this.currentProductGroup,...this.lenta.value.filter(
        //     d=>d.account_name == product).map(d=>({
        //     "value" : d.product_group , "checked" : true
        // }))]
        // this.currentProductGroup =[...new Set(this.currentProductGroup.map(v=>v.value))].map(e=>({"value" : e,"checked" : true}))
        // debugger
        //// console.log(this.currentProductGroup , "currentproductgroup")

        //    let update =  this.lenta.value.find(d=>(d.account_name === product))

        let ctrl =  this.lenta.controls.filter(d=>(d.get('account_name')?.value == product))
        this.currentProductGroup = [];
        //   // console.log(ctrl , "update form valus..")
        for(var i=0; i<this.lenta.value.length;i++){
            if($event.value == 'Internal'){
                this.popupInternalCheck = false;

                if(!this.lenta.value[i].disable_internal){
                    this.currentProductGroup.push(  {
                        "value" : this.lenta.value[i].product_group , "checked" : true
                    })
                }

            }else if($event.value == 'External'){
                this.popupExternalCheck = false;
                if(!this.lenta.value[i].disable_private){
                    this.currentProductGroup.push(  {
                        "value" : this.lenta.value[i].product_group , "checked" : true
                    })
                }

            }else{
                this.currentProductGroup.push(  {
                    "value" : this.lenta.value[i].product_group , "checked" : true
                })
            }

           
        }
        ctrl.forEach(c=>{
            let patch = {}
            if($event.value == 'Elasticity'){
                patch['follow_competition'] =  $event.checked


            }
            //    if($event.value == 'Cogs'){
            //     patch['disable_cogs'] =  $event.checked

            //    }
            //    else if($event.value == 'List price'){
            //     patch['disable_list_price'] =  $event.checked

            //    }else if($event.value == 'Retail price'){
            //     patch['disable_rsp'] =  $event.checked

            //    }else if($event.value == 'Elasticity'){
            //     patch['follow_competition'] =  $event.checked
            //     // return

            //    }
            //    else{
            //     patch['disable_promo'] =  $event.checked

            //    }
            c.patchValue(patch)

        })
        //    debugger

        if($event.checked){
            this.applyAllMetric = $event.value
            // this.checkedInternal = true;
            if($event.value != 'Elasticity'){

                this.sendMessage('apply-all-popup')

            }

        }else{
            if($event.value == 'Internal'){

                for(var i=0; i<this.lenta.value.length;i++){
                    this.lenta.at(i).patchValue({
                        "internal_competition" : false,
                        "internal":false
                    })
            }
        }
            if($event.value == 'External'){
                
                for(var i=0; i<this.lenta.value.length;i++){
                    this.lenta.at(i).patchValue({
                        "external_competition" : false,
                        "private":false
                    })
                }
             
            }
        }

        // sendMessage()"

    }

    openSavePopup(modal){
        if(this.disable_save_download){
            return
        }
        this.sendMessage(modal)
    }

    fileUpload($event){
       // console.log($event , "iploadfile even")
        this.uploaded_file = $event

    }
    uploadFile(){
        let filterForm:any = []
        this.pricingService.uploadWeeklyPricing(this.uploaded_file).subscribe(data=>{
           // console.log(data , "uploaded file data return")

            if(data){
                if(data.length == 0){
                    this.toastr.error("please modify price for atleast one retailers")
                    return
                }

                this.lenta.clear()
                let retailer = {

                }
                data?.payload?.forEach(element => {
                    if(element['account_name'] in retailer){
                        retailer[element['account_name']]['count'] = retailer[element['account_name']]['count'] + 1
                      }
                      else{
                        retailer[element['account_name']] = {
                            "count" : 1
                        }
                      }
                    filterForm.push({
                        "retailer" : element['account_name'],
                        "product_group" : element['product_group'],
                    })

                    this.lenta.push(this.formBuilder.group({
                        retailer : [element['account_name']+element['product_group']],
                        account_name :[element['account_name']],
                        product_group : [element['product_group']],
                        // list_price: [Number(element['list_price']).toFixed(2)],
                        inc_list_price : [0],
                        cogs: [Number(element['cogs']).toFixed(2)],
                        inc_cogs: [Number(element['cogs_inc'])],
                        base_elasticity : [Number((element['elasticity']).toFixed(2))],
                        net_elasticity : [Number((element.net_elasticity)).toFixed(2)],
                        nsv_per_kg : [Number((element['nsv_kg_base']).toFixed(2))],
                        inc_nsv_per_kg : [Number((element['nsv_kg_inc']).toFixed(2))],
                        // changed_nsv_per_kg : [element['nsv_unit_promo_inc'] ? Number((element['nsv_unit_promo_inc']).toFixed(2)) : 0],
                        rsp: [Number((element['rsp_base']).toFixed(2))],
                        promo_price : [0],
                        inc_promo_price : [0],
                        inc_rsp: [Number((element['rsp_inc']).toFixed(2))],
                        disable_per_unit_in_promo : [this.disable_per_unit_promo],
                        per_unit_in_promo : [100],
                        follow_competition: [false],
                        internal_competition: [false],
                        external_competition: [false],
                        internal_elasticity : [Number((element.net_internal_elasticity)).toFixed(2)],
                        external_elasticity : [Number((element.net_external_elasticity)).toFixed(2)],
                        list_price_date :[null],
                        cogs_date :[moment(element['cogs_date']).utc(true)],
                        rsp_date :[moment(element['rsp_date']).utc(true)],
                        promo_date : [null],
                        nsv_date:[moment(element['nsv_date']).utc(true)],
                        disable_list_price : [false],
                        disable_cogs : [false],
                        disable_rsp : [false],
                        disable_elasticity : [false],
                        disable_promo : [false],
                        is_tpr_constant : [false],
                        disable_internal : [element['internal'] == 'not applicable'],
                        disable_private : [element['private'] == 'not applicable'],
                        // disable_others : [true ? element['others'] == 'not applicable' : false],
                        internal : [element['internal'] == "on" && element['internal'] != 'not applicable'],
                        private : [element['private'] == "on" && element['private'] != 'not applicable'],
                        // others : [true ? element['others'] == 'on' : false]
                        // avg_tpr : [tpr_avg]


                      }))
                    //   Object.keys(retailer).forEach(r=>{
                    //     if(retailer[r]['count'] > 1){
                    //       let ctrl =  this.lenta.controls.filter(d=>(d.get('account_name')?.value == r))
                    //      ctrl.forEach(c=>{
                    //
                    //          c.patchValue({
                    //              "disable_internal" : true
                    //          })
                    //      })
                    //
                    //     }
                    //
                    // })



                })
                this.displayProduct = this.pricingForm.controls.products.value.map(d=>d.account_name)
                this.displayProduct =  [...new Set(this.displayProduct)]
                if(this.displayProduct.length > 0){

                    this.isExpand = true
                }
                else{
                    this.isExpand = false
                }
                this.uploadFormUpdateEvent.emit(filterForm)
                setTimeout(()=>{
                    this.abs = data['is_abs']

                },500)

            }



        })
 }

    sendMessage(modalType: string): void {
        // if(modalType == )
        this.modalEvent.emit(modalType);
    }
    subProductSelectEvent(event){
       // console.log(event , "sub product event...")
        this.selected_sub_product = event
        this.currentProduct = this.selected_main_product + this.selected_sub_product
        //// console.log(this.selected_sub_product , "selected sub product")
    }
    selectMainProduct(product){
        this.selected_main_product = product
        //// console.log(this.selected_main_product , "selected main product...")
    }
    onTabChanged(e){
        this.selected_main_product = this.displayProduct[e.index]
        this.currentProduct = this.selected_main_product + this.selected_sub_product
        //// console.log(this.displayProduct[e.index] , "display producr")
        // e.index
        //// console.log(e, "tab event...")
       // console.log(this.selected_main_product)
    }

    // sho and hide more action menu
    isShowDivIf = true;

    toggleDisplayDivIf() {
        this.isShowDivIf = !this.isShowDivIf;
    }

    // expand and collapse
    isExpand = false;
    expandHeader() {
        this.isExpand = !this.isExpand;
        // this.abs= false
    }
    // get lenta():FormArray{
    //     // debugger
    //     return
    // }

    products: any[] = [
        {
            productName: 'Walmart',
        },
        {
            productName: 'Target',
        },
        {
            productName: 'Kohl’s',
        },
        {
            productName: 'Home Depot',
        },
        {
            productName: 'Publix',
        },
        {
            productName: 'Dollar Tree',
        },
        {
            productName: 'Costco',
        },
        {
            productName: 'Target',
        },
    ];

    productItems: any[] = [
        {
            productItemName: 'Milkyway XXL',
        },
        {
            productItemName: 'Skittles XXL',
        },
        {
            productItemName: 'Juicy Fruit XXL',
        },
        {
            productItemName: 'Bounty XXL',
        },
        {
            productItemName: 'Orbit XXL',
        },
        {
            productItemName: 'Skittles XXL',
        },
        {
            productItemName: 'Juicy Fruit XXL',
        },
        {
            productItemName: 'Bounty XXL',
        },
    ];

    select(index: number) {
        this.selectedIndex = index;
    }

    openTab = 0;
    toggleTabs($tabNumber: number): void {
        this.openTab = $tabNumber;
    }
    applyDateTopopup(date , i , type , disable = false){
        if(disable){
            return
        }

        this.selectedDate= date
        this.date_form = {
            "index": i,
            "metric_type" : type
        }


       this.modalService.open("calendar-popup")
    }
    applyCloseEventCalendarPopup($event){
        let patch = {

        }
        if($event["date_form"]["metric_type"] == 'promo'){
            patch = {
                promo_date : $event["value"]["applyDate"]
            }

        }
        else if($event["date_form"]["metric_type"]=="cogs"){
            patch = {
                cogs_date : $event["value"]["applyDate"]
            }

        }
        else if($event["date_form"]["metric_type"]=="listprice"){
            patch = {
                list_price_date : $event["value"]["applyDate"]
            }

        }
        else if($event["date_form"]["metric_type"]=="retail"){
            patch = {
                rsp_date : $event["value"]["applyDate"]
            }

        }
        else if($event["date_form"]["metric_type"]=="nsv"){
            patch = {
                nsv_date : $event["value"]["applyDate"]
            }

        }
        this.lenta.at($event["date_form"]["index"]).patchValue(patch)
       // console.log($event , "$event popup...")
        this.modalService.close('calendar-popup')
    }
    openInfoEvent($event){
        this.modalService.open($event)
    }

    load_scenario_event($event){
        this.modalService.close('load-scenario-pricingtool-popup')
        this.chosen_promotion = $event as ListPromotion
       this.loadScenarioEvent.emit($event)
      // console.log(this.chosen_promotion , "chosen promotion.........")
    }
    clearFormArray = (formArray: FormArray) => {
        formArray = this.formBuilder.array([]);
      }
      _updatePromoPriceVar(e:PricingModel , form){
          if(e.tpr_discount){
form['promo_price'] = form['promo_price'] +  utils.reducePercent(e.retail_median_base_price_w_o_vat , e.tpr_discount)
form['promo_price_count'] = form['promo_price_count'] + 1
          }

      }
      _updateASPVar(e:PricingModel , form){
        if(e.tpr_discount){
form['asp'] = form['asp'] +  e.retail_median_base_price_w_o_vat
form['asp_count'] = form['asp_count'] + 1
        }

    }
    promo_changed($event , i){
        let base_rsp =  this.lenta.at(i).get('rsp')?.value
        let inc_rsp_per = this.lenta.at(i).get('inc_rsp')?.value
        let base_promo =  this.lenta.at(i).get('promo_price')?.value
        let inc_promo_per = this.lenta.at(i).get('inc_promo_price')?.value
        let tpr = utils.findPercentDifference(
            utils.increasePercent(base_rsp,inc_rsp_per),
            utils.increasePercent(base_promo , inc_promo_per)

        )
        this.lenta.at(i).patchValue({
         "avg_tpr" : tpr
     })



    }
    unit_promo_changed($event , i){

    }
    nsv_changed($event , i){
        console.log($event , "nsv change triggered....")
        let baselp =  this.lenta.at(i).get('list_price')?.value
        let inclp =  this.lenta.at(i).get('inc_list_price')?.value
        let basensv = this.lenta.at(i).get('nsv_per_kg')?.value
        let nsv = this.lenta.at(i).get('inc_nsv_per_kg')?.value
        // console.log(lp , basensv , nsv , "bases")
        let cal_nsv,cal_lp
        if(this.abs){
            cal_nsv = nsv
            cal_lp = inclp

        }
        else{
            cal_nsv =  utils.increasePercent(basensv,nsv)
            cal_lp = utils.increasePercent(baselp,inclp)

        }
        console.log(cal_lp , "cal_lpcal_lpcal_lpcal_lpcal_lpcal_lp")

        // new nsv/unit = (nsv/unit-promo)*(% units in promo) + (nsv/unit- non promo)*(100% - % units in promo)
        let per_unit_promo = this.lenta.at(i).get('per_unit_in_promo')?.value

        let new_nsv = ((cal_nsv * (per_unit_promo)/100)) +
        (cal_lp) * (100/100 - per_unit_promo/100)


        // nsv_unit_promo * (per_unit_promo/100)  +  new_lp * (1 - (per_unit_promo/100))

        this.lenta.at(i).patchValue({
            "changed_nsv_per_kg" : Number((new_nsv).toFixed(2))
        })
    }
      rsp_changed($event , i){
          let tpr_const = this.lenta.at(i).get('is_tpr_constant')?.value
          if(tpr_const){
              this.lenta.at(i).patchValue({
                  "inc_promo_price" : $event
              })
          }
          else{
            //   debugger
           let base_rsp =  this.lenta.at(i).get('rsp')?.value
           let inc_rsp_per = this.lenta.at(i).get('inc_rsp')?.value
           let base_promo =  this.lenta.at(i).get('promo_price')?.value
           let inc_promo_per = this.lenta.at(i).get('inc_promo_price')?.value
           let tpr = utils.findPercentDifference(
               utils.increasePercent(base_rsp,inc_rsp_per),
               utils.increasePercent(base_promo , inc_promo_per)

           )
           this.lenta.at(i).patchValue({
            "avg_tpr" : tpr
        })



          }
        //  // console.log(tpr_const , "tpr constant")
        //  // console.log($event , i , "rsp changed")
      }
      _populateForm(form){
          let retailer = {

          }
        //   this.abs = false;
          Object.values(form).forEach((e:any)=>{
              console.log(e, '              console.log()');
              if(e.account_name in retailer){
                retailer[e.account_name]['count'] = retailer[e.account_name]['count'] + 1
              }
              else{
                retailer[e.account_name] = {
                    "count" : 1
                }
              }
            //   debugger
              this.lenta.push(this.formBuilder.group({
                retailer : [e.retailer],
                account_name : [e.account_name],
                product_group : [e.product_group],
                list_price: [Number((utils._divide(e.list_price ,e.list_price_count )).toFixed(2))],
                inc_list_price : [0],
                cogs: [Number(utils._divide(e.cogs ,e.cogs_count )).toFixed(2)],
                inc_cogs: [0],
                elasticity : [Number((e.elasticity)).toFixed(2)],
                  net_elasticity : [Number((e.net_elasticity)).toFixed(2)],
                  base_elasticity : [Number((e.base_elasticity)).toFixed(2)],
                  internal_elasticity : [Number((e.internal_elasticity)).toFixed(2)],
                  external_elasticity : [Number((e.external_elasticity)).toFixed(2)],
                  nsv_per_kg :[Number(utils._divide(e.nsv_per_kg ,e.nsv_count )).toFixed(2)],
                //  [Number(e.nsv_per_unit.toFixed(2))],
                  inc_nsv_per_kg : [0],
                changed_nsv_per_kg :[Number(utils._divide(e.nsv_per_kg ,e.nsv_count )).toFixed(2)],
                rsp: [Number((utils._divide(e.rsp ,e.rsp_count )).toFixed(2))],
                promo_price : [Number((utils._divide(e.promo_price ,e.promo_price_count )).toFixed(2))],
                inc_promo_price : [0],
                inc_rsp: [0],
                disable_per_unit_in_promo : [this.disable_per_unit_promo],
                per_unit_in_promo : [100],
                follow_competition: [false],
                  internal_competition: [false],
                  external_competition: [false],
                list_price_date :[null],
                cogs_date :[null],
                rsp_date :[null],
                nsv_date:[null],
                promo_date : [null],
                disable_list_price : [false],
                disable_cogs : [false],
                disable_rsp : [false],
                disable_elasticity : [false],
                disable_promo : [false],
                is_tpr_constant : [false],
                disable_internal : [e.disable_internal],
                disable_private : [e.disable_private],
                disable_others : [e.others],
                internal : [e.internal && !e.disable_internal],
                private : [e.private && !e.disable_private],
                others : [false],
                external_competitor_elasticity:e.external_competitor_elasticity,
                internal_competitor_elasticity:e.internal_competitor_elasticity

                // avg_tpr : [tpr_avg]


              }))
          })
          // Object.keys(retailer).forEach(r=>{
          //     console.log(r, 'rrrrrrrr');
          //     if(retailer[r]['count'] > 1){
          //       let ctrl =  this.lenta.controls.filter(d=>(d.get('account_name')?.value == r))
          //      ctrl.forEach(c=>{
          //
          //          c.patchValue({
          //              "disable_internal" : true
          //          })
          //      })
          //
          //     }
          //
          // })
         // console.log(this.lenta , "lentaform....")

         // console.log(retailer , "retailer prodyuct count....")

        //   this.lenta.valueChanges.subscribe(data=>{
        //      // console.log(data , "data value changes lenta")
        //       data.forEach((element , index) => {

        //         //   this.lenta.at(index).patchValue({
        //         //       "inc_promo_price" : element.inc_rsp,


        //         //   },
        //         //   {emitEvent: false})

        //       });
        //   })
      }
      valueChangeElasity(event,i, type){
        if (type === 'internal') {
            this.lenta.at(i).patchValue({
                "internal_competition": event
            })
        } else {
            this.lenta.at(i).patchValue({
                "external_competition" : event,
            })
        }
      }
    groupPricing(){
        // debugger
        let mindate
        let maxdate

       // console.log(this.pricingArray , "pricing Array...")
        if(this.pricingArray.length > 0){
            mindate = new Date(this.pricingArray[0].date)
            maxdate = new Date(this.pricingArray[0].date)
            // this.disable_button = false
            this.isExpand = true
        }
        else{
            // this.disable_button = true
            this.isExpand = false

        }
        this.unique_retailers = []
       this.lenta.clear()

let form={

}
        this.pricingArray.forEach((e: any)=>{
            let retailer = e.account_name + e.product_group
            if(retailer in form){
                form[retailer]["list_price"] = form[retailer]["list_price"] +  e.list_price ,
                form[retailer]["list_price_count"]  = form[retailer]["list_price_count"] + 1,
                form[retailer]["cogs"]  = form[retailer]["cogs"]+ e.cogs,
                form[retailer]["cogs_count"] = form[retailer]["cogs_count"] + 1,
                form[retailer]["rsp"]  = form[retailer]["rsp"]  +  e.retail_median_base_price_w_o_vat,
                form[retailer]["rsp_count"]  =  form[retailer]["rsp_count"]+ 1,
                form[retailer]["nsv_per_kg"]  = form[retailer]["nsv_per_kg"]  +  e.nsv_per_kg,
                form[retailer]["nsv_count"]  =  form[retailer]["nsv_count"]+ 1
            }
            else{
            form[retailer] = {
                "list_price" : e.list_price ,
                "list_price_count" : 1,
                "disable_internal": e.disable_internal,
                "disable_private": e.disable_private,
                "internal" : e.internal,
                "private" : e.private,
                "cogs" : e.cogs,
                "cogs_count" : 1,
                "rsp" : e.retail_median_base_price_w_o_vat,
                "rsp_count" : 1,
                "elasticity" : e.base_price_elasticity,
                "nsv_per_kg" : e.nsv_per_kg,
                "nsv_count" : 1,
                "promo_price" : 0,
                "promo_price_count" : 0,
                "asp" : 0,
                "asp_count" : 0,
                "retailer" : e.account_name + e.product_group,
                "account_name" : e.account_name,
                "product_group" : e.product_group,
                "internal_elasticity": e.net_internal_elasticity,
                "external_elasticity": e.net_external_elasticity,
                "net_elasticity" :  e.net_elasticity, //e.net_elasticity
                "base_elasticity" :  e.base_price_elasticity,//e.net_elasticity,
                "external_competitor_elasticity":e.external_competitor_elasticity,
                "internal_competitor_elasticity":e.internal_competitor_elasticity
            }
            }
            this._updatePromoPriceVar(e, form[retailer])
            this._updateASPVar(e, form[retailer])




            e.date = new Date(e.date)
            if(e.date < mindate){
                mindate = e.date
            }
            if(e.date > maxdate){
                maxdate = e.date
            }




        })
        if(this.pricingArray.length > 0){
            // debugger
            this.datePickerConfig = {
                ...this.datePickerConfig,
               ...{ min : `${mindate.getDate()}-${mindate.getMonth()+1}-${mindate.getFullYear()}`,
                  max : `${maxdate.getDate()}-${maxdate.getMonth()+1}-${maxdate.getFullYear()}`

               }
              };
             // console.log(mindate , "datepickconfig mindate")
             // console.log(maxdate , "datepickconfig maxdate")
             // console.log(this.datePickerConfig , "datepickconfig")
            //   this.selectedDate = `${mindate.getDate()}-${mindate.getMonth()+1}-${mindate.getFullYear()}`

        }
        else{
            this.datePickerConfig = {
                min : '1-1-2022',
                max : '31-12-2022'
            }

        }


        this._populateForm(form)
       // console.log(form , "formpromopriceinclusion")
        // debugger
        if(this.chosen_promotion){
            // debugger
            if(utils.isArray(this.chosen_promotion.meta)){
                (this.chosen_promotion.meta as MetaInfo[]).forEach(m=>{
                    let pricing = m.pricing as PricingPromoModel
                   let ctrl =  this.lenta.controls.find(d=>(d.get('account_name')?.value == m.retailer) &&
                    (d.get('product_group')?.value == m.product_group))
                   // console.log(ctrl , "contol chosen")



                    ctrl?.patchValue({
                        list_price_date : pricing.list_price_date ? moment(pricing.list_price_date , "YYYY-MM-dd"):pricing.list_price_date,
                        cogs_date :pricing.cogs_date ? moment(pricing.cogs_date, "YYYY-MM-dd") :pricing.cogs_date,
                        rsp_date :pricing.rsp_date ? moment(pricing.rsp_date, "YYYY-MM-dd"): pricing.rsp_date,
                        nsv_date :pricing.nsv_date ? moment(pricing.nsv_date, "YYYY-MM-dd"): pricing.nsv_date,
                        promo_date : pricing.promo_date,
                        inc_cogs : pricing.cogs,
                        inc_list_price : pricing.lpi,
                        inc_rsp :pricing.rsp,
                        inc_nsv_per_kg : pricing.nsv,
                        internal: pricing.internal,
                        private: pricing.private,
                        external_competition:pricing.private,
                        internal_competition:pricing.internal


                    })
                    let basensv = ctrl?.get('nsv_per_kg')?.value
                    let nsv = ctrl?.get('inc_nsv_per_kg')?.value
                    let lp =   ctrl?.get('list_price')?.value
                    // new nsv/unit = (nsv/unit-promo)*(% units in promo) + (nsv/unit- non promo)*(100% - % units in promo)
                    // let per_unit_promo = 100/100
                    let per_unit_promo = ctrl?.get('per_unit_in_promo')?.value
                    let cal_nsv =  utils.increasePercent(basensv,nsv)

                    let new_nsv = ((cal_nsv * (per_unit_promo)/100)) +
                    (lp) * (100/100 - per_unit_promo/100)
                    // + (nsv - lp) * (per_unit_promo - per_unit_promo))

                    ctrl?.patchValue({
                        "changed_nsv_per_kg" : Number(new_nsv.toFixed(2))
                    })
                    // let base_rsp =  ctrl?.get('rsp')?.value
                    // let inc_rsp_per = ctrl?.get('inc_rsp')?.value
                    // let base_promo =  ctrl?.get('promo_price')?.value
                    // let inc_promo_per = ctrl?.get('inc_promo_price')?.value
                //     let tpr = utils.findPercentDifference(
                //         utils.increasePercent(base_rsp,inc_rsp_per),
                //         utils.increasePercent(base_promo , inc_promo_per)

                //     )
                //     ctrl?.patchValue({
                //      "avg_tpr" : tpr
                //  })

                })

            }

            // let ret = (this.chosen_promotion.meta as MetaInfo[]).find(d=>d.retailer == e.account_name && d.product_group == e.product_group)
        }

        this.unique_retailers = this.lenta.value
       // console.log(this.unique_retailers , "unique retailers/...")
        if(this.unique_retailers.length > 0){
            this.currentProduct = this.unique_retailers[0]['retailer']
            this.selected_main_product = this.unique_retailers[0]['account_name']
            this.selected_sub_product = this.unique_retailers[0]['product_group']
            this.currentProduct = this.selected_main_product + this.selected_sub_product

        }



        //// console.log(arr , "final array unique")
       // console.log(this.pricingForm , "pricing form values")
        //// console.log)

        // pricingForm.get('Lenta').controls.get('products')'
        this.displayProduct = this.pricingForm.controls.products.value.map(d=>d.account_name)
        this.displayProduct =  [...new Set(this.displayProduct)]
        if(this.displayProduct.length > 0){

            this.isExpand = true
        }
        else{
            this.isExpand = false
        }




    }


    simulatePrice(value){
        let form_value = this.pricingForm.value
        console.log(this.abs , "absolutepercent")
        console.log(this.lenta , "formvalue")
        if(this.abs){
            form_value.products.forEach(d=>{
                console.log(d,"dddd")
                d.inc_rsp =  Math.round(Number(utils.findPercentDifference(d.inc_rsp,d.rsp)))
                d.inc_cogs = Math.round(Number(utils.findPercentDifference(d.inc_cogs,d.cogs)))
                d.inc_list_price = Math.round(Number(utils.findPercentDifference(d.inc_list_price,d.list_price)))
            })
        }
       // console.log(form_value , "formvalue changes..")


        if(value == 'reset'){
            this.chosen_promotion = null as any
            this.simulateResetEvent.emit({
                "type" : value,
                'data' : form_value
            })

        }
        else{
            if(this.disable_button){
                return
            }
            this.simulateResetEvent.emit({
                "type" : value,
                'data' : form_value
            })

        }


    }

    getTabLength(){
        // debugger
        var itemsLength = $(".mat-tab-label").length;
        var itemSize = $(".mat-tab-label").outerWidth(true);
        var getMenuSize  = itemsLength * itemSize!
        var getMenuWrapperSize =  $(".mat-tab-label-container").outerWidth();
       // console.log(itemsLength, "itemsLength")
       // console.log(itemSize, "itemSize")
        if(getMenuSize > getMenuWrapperSize!){
            $(".mat-tab-header-pagination").css('display' , 'flex')
        }
        else{
            $(".mat-tab-header-pagination").css('display' , 'none')
        }


        // mat-tab-header-pagination-chevron
        // mat-tab-header-pagination-chevron
        //// console.log(getMenuWrapperSize , "menu wrapper ")
        //// console.log(getMenuSize , "get menu size...")
    }
    ngAfterViewInit() {
        this.getTabLength()
        // this.accordion.openAll()

    }

    tpr_change($event , i){
       // console.log($event , i , "event with i")
        // debugger;
        let pro = this.lenta.at(i).get('promo_price')?.value
        // if(!pro){
        //     return
        // }
       // console.log(pro , "promo price")
        this.lenta.at(i).patchValue({
            "disable_promo" : $event.checked
        })

        if($event.checked){
            let rsp_change = this.lenta.at(i).get('inc_rsp')?.value
            this.lenta.at(i).patchValue({
                "inc_promo_price" : rsp_change
            })
            let base_rsp =  this.lenta.at(i).get('rsp')?.value
           let inc_rsp_per = this.lenta.at(i).get('inc_rsp')?.value
           let base_promo =  this.lenta.at(i).get('promo_price')?.value
           let inc_promo_per = this.lenta.at(i).get('inc_promo_price')?.value
           let tpr = utils.findPercentDifference(
               utils.increasePercent(base_rsp,inc_rsp_per),
               utils.increasePercent(base_promo , inc_promo_per)

           )
           this.lenta.at(i).patchValue({
            "avg_tpr" : tpr
        })


        }
        // this.lenta.at(i).get('promo_price')?.disable();
//         if($event.checked){
//             this.lenta.get(i)?.patchValue({
//                 "disable_promo" : $event.checked
// })

//         }
//         else{
//             this.lenta.get(i)?.patchValue({
//                 "disable_promo" : $event.checked
// })

//         }

    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
      }

    ngOnInit() {
        this.tenant = location.pathname.split("/")[1]
        if(location.pathname.includes('/france/')){
            this.disable_per_unit_promo = false

        }
        else{
            this.disable_per_unit_promo = true
        }
        //// console.log(location.pathname , "location pathname ................")
        this.pricingService.getPricingSimulatedObservable()
        .pipe(takeUntil(this.destroy$)).subscribe(data=>{
            if(data){
                this.price_simulated = data
                this.disable_save_download = false
                this.isExpand = false
            }
            else{
                this.disable_save_download = true
            }
        })
        this.authService.getUser()
        .pipe(takeUntil(this.destroy$)).subscribe(user=>{
            if(user){
                this.user = user
                this.is_admin = this.user.user.is_superuser

            }


        })

        // this.lenta.valueChanges.subscribe(data=>{

        //     data.forEach((element , index) => {
        //        // console.log(element , index , "element and index...")
        //         if(element.is_tpr_constant){
        //             this.lenta.at(index).patchValue({
        //                 "disable_promo" : true
        //             })

        //         }
        //         else{
        //             this.lenta.at(index).patchValue({
        //                 "disable_promo" : false
        //             })

        //         }

        //     });

        // })



        // this.pricingForm.valueChanges.subscribe(data=>{
        //    // console.log(data , "data ...form changes")
        //     // if(data['products']['is_tpr_constant']){

        //     // }
        //     // else{

        //     // }
        //     //// console.log(data , "values changes form prcing form....")
        // })
    }
    ngOnChanges(changes : SimpleChanges) :void{
        for (let property in changes) {
            if (property === 'pricingArray') {
                this.pricingArray = changes[property].currentValue
                this.groupPricing()
                this.disable_save_download = true

            }
            // if (property === 'count_ret') {
            //    // console.log(changes[property].currentValue , "count_ret")
            //     // this.pricingArray = changes[property].currentValue
            //     // this.groupPricing()

            // }
            if (property === 'outerClick') {
                this.isShowDivIf = true;
            }
    }
    }

    changeIncEvent($event: any, i: any, type) {
        console.log($event);
        switch (type) {
            case 'cogs':
                this.lenta.at(i).patchValue({
                    "inc_cogs" : $event
                });
                break;
        }
    }
}
