import { Component, OnInit , Input,SimpleChanges, Output , EventEmitter } from '@angular/core';
import { CheckboxModel, HierarchyCheckBoxModel, Product } from '@core/models';
import { SimulatorService } from '@core/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'nwn-add-new-pricingtool-popup',
  templateUrl: './add-new-pricingtool-popup.component.html',
  styleUrls: ['./add-new-pricingtool-popup.component.css']
})
export class AddNewPricingtoolPopupComponent implements OnInit {

  searchText  = ''

  all_ : CheckboxModel = {"value" : "All" , "checked" : false}

  @Input()
  heading = 'Filter by product groups'

  @Input()
  hierarchy_model : Array<HierarchyCheckBoxModel> = []

  @Input()
  count_ret:any
  @Input()
  filter_model





  @Output()
  hier_null = new EventEmitter()

  @Output()
  productChange = new EventEmitter()

  @Output()
  filterApply  = new EventEmitter()

    childLength = 0;

  selectedHierModel:any[] = []

  // Product groups

  constructor(public restApi: SimulatorService,private toastr: ToastrService,) { }

  ngOnInit(): void {
    this.restApi.ClearScearchText.asObservable().subscribe(data=>{

      this.searchText = ""
      if(data=="addnew-pricngtool"){
        //console.log(this.filter_model , "filter model...")
        //console.log(this.count_ret , "count ret.........")
        if(this.count_ret){
        if(this.count_ret["retailers"].length == 0){

          this.hierarchy_model.forEach(d=>{
            d.checked = false
            d.child.forEach(ch=>ch.checked = false)
            // this.productChange.emit({"value" : d.value , "checked" : false})

          })

        }
        if(this.count_ret["products"].length == 0){


          this.hierarchy_model.forEach(d=>{

              d.child.forEach(de=>{
                de.checked = false
              })

          })
        }

      }

      }
    })
  }

  inputChangeEvent($event){
    this.searchText = $event
  }


  validateHier(){
    let parent_valid = false
    let child_valid = false
    this.hierarchy_model.forEach(d=>{
      if(d.checked){
        parent_valid = true
        d.child.forEach(d=>{
          if(d.checked){
            child_valid = true

          }
        })
      }
    })
    if(!parent_valid){
      this.toastr.error("choose atleast one retailer")
      return

    }
    if(!child_valid){
      this.toastr.error("choose product for retailer")
      return
    }

    return parent_valid && child_valid
  }
  allselect($event){

    if($event.checked){
      this.hierarchy_model.forEach(d=>{

         d.checked = true
        d.child.forEach(ch=>{
          ch.checked = true
        })

    })


    }
    else{
      this.hierarchy_model.forEach(d=>{

        d.checked = false
       d.child.forEach(ch=>{
         ch.checked = false
       })

   })



    }


  }

    productcheck = 0;
    valueChangeSelect(event:any){
        // {"value" : '' , "checked" : false}
        // this.productChange.emit(event)
        let ret = this.hierarchy_model.filter(d=>d.value == event.value)[0]
        ret.checked = event.checked
        if(event.checked){
            this.productcheck ++;
        }else{
            this.productcheck --;
        }
        if(this.productcheck == this.hierarchy_model.length){
            this.all_ = {...this.all_ , ...{"checked": true}}
        }else{
            this.all_ = {...this.all_ , ...{"checked": false}}
        }
        ret.child.forEach(ch=>{
            ch.checked =event.checked
        })
        //console.log(event , "value change event..")

    }

  checkTrue(children:CheckboxModel[]){
    let ret = false
    children.forEach(d=>{
      if(d.checked){
        ret = true

      }
    })
return ret
  }

    productcheckChild = 0;
    lengthchecked = false;
    valueChangeSelectProduct(event:any , retailer){
        if(!this.lengthchecked){
            this.lengthchecked = true;
            this.hierarchy_model.forEach(d=>{
                this.childLength += d.child.length;

            })
        }

        let ret = this.hierarchy_model.filter(d=>d.value == retailer.value)[0]
        ret.child.filter(ch=>ch.value == event.value)[0].checked = event.checked
        ret.checked = this.checkTrue(ret.child)
        this.productcheckChild = 0;
        for(var i=0; i<this.hierarchy_model.length;i++){
            for(var j=0;j<this.hierarchy_model[i].child.length;j++){
                if(this.hierarchy_model[i].child[j].checked){
                    this.productcheckChild ++;
                }
            }
        }

        if(this.childLength == this.productcheckChild ){
            this.all_ = {...this.all_ , ...{"checked": true}}
        }else{
            this.all_ = {...this.all_ , ...{"checked": false}}
        }
    }

  apply(){
    // //console.log(this.hierarchy_model , "hiermodel")

    // //console.log(data , "genrated data..")

    if(this.validateHier()){
      this.filterApply.emit({
      "key" : "Product groups",

    })
  }
    // }
    // this.filterApply.emit({
    //   "key" : "Product groups"
    // })
  }
  ngOnChanges(changes: SimpleChanges) {

    for (let property in changes) {
      if (property === 'heading') {
        if(changes[property].currentValue ==  "select retailer and product"){
          this.all_.checked = true
        }

      }}
    // //console.log(changes , "changes")


}

}
