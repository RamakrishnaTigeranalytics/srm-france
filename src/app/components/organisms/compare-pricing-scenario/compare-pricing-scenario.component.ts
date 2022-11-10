import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    OnChanges,
    DoCheck,
    ChangeDetectorRef,
    HostListener,
} from '@angular/core';
import { ListPromotion } from '@core/models';
import { ModalService } from '@molecules/modal/modal.service';
import {OptimizerService , PricingService} from "@core/services"
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'nwn-compare-pricing-scenario',
  templateUrl: './compare-pricing-scenario.component.html',
  styleUrls: ['./compare-pricing-scenario.component.css']
})
export class ComparePricingScenarioComponent implements OnInit {

  // selectedIndex!: number;
  searchText : string = ""
  selected_id:Array<number> = []
  list_promotion:Array<ListPromotion> = []
  listOfPromotions :Array<ListPromotion> = []
  selected_promotion : ListPromotion = null as any
  config = {
    displayKey: 'name', // if objects array passed which key to be displayed defaults to description
    // search: true,
    placeholder: 'Select User',
};
  checkedValue = false;

singleSelect = '';
optionsUserName : any[] = [];
  @Output()
  load_scenario_event = new EventEmitter()

  constructor(private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private modal : ModalService,private optimizerService : OptimizerService ,
     private pricingService : PricingService) { }

  ngOnInit(): void {

    this.optimizerService.getListObservation().subscribe(data=>{
      var loadedData =[] as any;
      this.checkedValue = false;
        console.log(data, 'data');
      if(data){
          this.list_promotion = [];
          this.list_promotion.forEach((item: any) => {
              item.checked = false;
          })
          this.list_promotion = data.filter(data=>data.scenario_type == "pricing")
          this.listOfPromotions = this.list_promotion
          this.list_promotion.forEach((element:any)=> {
            loadedData.push(element.user.email)
          });
      }
      this.optionsUserName = [...new Set(loadedData)];

      //console.log(data , "LIST PROMOTION observable")
  })
  }

    toggleId($event){
    //console.log($event , "toggle event")
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
    //console.log(this.selected_id , "selected id selecting")

}


openComparePopup(){
  if(this.selected_id.length > 1){
      this.pricingService.setCompareScenarioIdObservable(this.selected_id)
      // this.checkedValue = false;
      this.cd.detectChanges();
      // this.list_promotion.forEach((item: any) => {
      //     item.checked = false;
      // })
      // this.selected_id = [];
      //console.log(this.selected_id , "selected save id")
      this.modal.close('compare-pricing-scenario')
      // this.modal.open('compare-scenario-popup')
  }
  else{
      this.toastr.error("Please select atleast two scenarios to compare")
  }
}
inputChangeEvent($event){
  this.searchText = $event
}
  select(index: number,slected_promotion) {
    // this.selectedIndex = index;
    // this.selected_promotion = slected_promotion
}
userDataChange(event){
  if(event.value.length > 1 ){
    this.list_promotion = [];
    var arr1= [] as any;
    var arr2 = [] as any;
    event.value.forEach(a=>{
      arr2=  this.listOfPromotions.filter(data=>(data.scenario_type == "pricing" && data.user?.email == a ))
      arr1.push(...arr2);
    })

    this.list_promotion = arr1;

  }else if(event.value.length == 1 ){
    this.list_promotion = [];
    this.list_promotion = this.listOfPromotions.filter(data=>(data.scenario_type == "pricing" && data.user?.email == event.value))
  }else{
    this.list_promotion = [];
    this.list_promotion = this.listOfPromotions;
  }
 }
}

