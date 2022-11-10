// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Input,Output,ViewChild,EventEmitter,SimpleChanges,ChangeDetectionStrategy } from '@angular/core';
 
import { ControlValueAccessor,NG_VALUE_ACCESSOR, } from '@angular/forms'
import {DatePickerComponent} from 'ng2-date-picker';


@Component({
    selector: 'nwn-pricing-metric-ip',
    templateUrl: './pricing-metric-ip.component.html',
    styleUrls: ['./pricing-metric-ip.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          multi:true,
          useExisting: PricingMetricIpComponent
        }
      ]
})
export class PricingMetricIpComponent implements ControlValueAccessor {

    @ViewChild('dayPicker') datePicker: DatePickerComponent;
    @Input()
    is_abs = false
    constructor() {}
    @Input()
    percentage = false;
    @Input()
    decimal_point = 2

    @Input()
    counterPer = 0;
    @Input()
    label = "List Price"
    @Input()
    base = 0

    @Input()
    disable = false

    @Output()
    valueChangedEvent = new EventEmitter()

    enabled = "abs"
    absenable = true
    symbol = ""
    @Input()
    currency = ""

    counter = 0;

    @Input()
    counterval=0

    open() { this.datePicker.api.open(); }  
    close() { this.datePicker.api.close(); }

    toggleEnable(){
        this.absenable = !this.absenable

    }

    togglePercent(percent){
        
        // console.log(percent)
        if(percent == "skip"){
            // console.log("inside if")
            return
        }
        this.percentage = percent
        
       
        // this.percentage = !this.percentage
        // console.log(this.percentage , "curr percent ")
    }

    onChange = (quantity) => {
        // console.log(quantity , "uantituy")
        
    };
    

  onTouched = () => {};


    changeEnabled(type){
        this.enabled = type
       

    }
    writeValue(quantity: number) {
       
        this.counter = quantity;
        this.counterPer = this.convertAbsolute(this.base , this.counter)
        
      }
    
      registerOnChange(onChange: any) {
        //   console.log(this.counter , "counter value ")
        //   console.log(this.base , "base value ...")
          
        this.onChange = onChange;
      }
    
      registerOnTouched(onTouched: any) {
        this.onTouched = onTouched;
      }

      
 
   
    _convertdecimal(n){
        // return Number(n.toFixed(2))
        return Number(n.toFixed(this.decimal_point))
    }

    increment() {
        
        if(this.disable){
            return
        }
       
        this.counter++;
        this.counter = this._convertdecimal(this.counter)
        
        if(this.is_abs){
            this.counterPer = this.convertPercent(this.base , this.counter)
            this.symbol = "%"

        }
        else{
            this.counterPer = this.convertAbsolute(this.base , this.counter)
            if(this.counterPer < 0){
                this.counterPer = 0
            }
            this.symbol = this.currency

        }
       
        
        
        this.onChange(this.counter)
        this.valueChangedEvent.emit(this.counter)
    }

    decrement() {
        if(this.disable){
            return
        }
        this.counter--;
        // if(this.counter < 0){
        //     this.counter = 0
        // }
        this.counter = this._convertdecimal(this.counter)
        if(this.is_abs){
            if(this.counter < 0){
                this.counter = 0
            }
            this.counterPer = this.convertPercent(this.base , this.counter)
            this.symbol = "%"

        }
        else{
            this.counterPer = this.convertAbsolute(this.base , this.counter)
            if(this.counterPer < 0){
                this.counterPer = 0
            }
            this.symbol = this.currency

        }
        
        
        this.onChange(this.counter)
        this.valueChangedEvent.emit(this.counter)
    }
    convertAbsolute(base , per){
        base = Number(base)
        per = Number(per)
        let abs = base + (base * per)/100
        

        // 
        return Number(abs.toFixed(this.decimal_point))

    }
    convertPercent(base , inc){
    
        base = Number(base)
        inc = Number(inc)
        if(!base){
            return 0
        }
        let per = ((inc - base)/base) * 100
        

        // return Number(per.toFixed(2))  removedecimal
        return Number(per.toFixed(this.decimal_point))        

    }
    onInputChange(event){
        debugger
        
         
        console.log(event.target.value , "on input change")
        console.log(this.is_abs , "is_abs..")
        let val = parseFloat(event.target.value)
        console.log(val , "parse flaot..")
    
        

        // console.log(val , "parsed value oninput change")
        if(val){
        if(this.disable){
            return
        }
        this.counter = val;
        
        
        // this.counter = this._convertdecimal(this.counter)
        if(this.is_abs){
            // debugger
            let matched = event.target.value.match(/[^0-9.]/g)
            console.log(matched)
            if(matched && matched.length > 0){
                this.counter = 0
                event.target.value = 0
                this.counterPer = this.convertPercent(this.base , this.counter)
                this.symbol = "%"
                return false
            }
            // debugger
            if(event.target.value < 0){
                // this.counter = 0
                event.target.value = 0
                // return
            }
            this.counterPer = this.convertPercent(this.base , this.counter)
            this.symbol = "%"

        }
        else{
            this.counterPer = this.convertAbsolute(this.base , this.counter)
            if(this.counterPer < 0){
                this.counterPer = 0
                // return
            }
            this.symbol = this.currency

        }
        // this.counterPer = this.convertAbsolute(this.base , this.counter)
        
        this.onChange(this.counter)
        this.valueChangedEvent.emit(this.counter)
    }
    else{
        if(!this.is_abs){
            this.counter = 0
            this.counterPer = this.convertAbsolute(this.base , this.counter)
            if(this.counterPer < 0){
                this.counterPer = 0
                // return
            }
            this.symbol = this.currency
            // return

        }
        else{
            this.counter = 0
            this.counterPer = this.convertPercent(this.base , this.counter)

        }
    }
    return true
        // console.log(val , "ip value...")
    }

    ngOnChanges(changes: SimpleChanges) {
         
 
      
        for (let property in changes) {
            if (property === 'is_abs') {
            
                this.is_abs = changes[property].currentValue


                    let counterper = this.counterPer
                    let counter = this.counter
                    this.counter = counterper
                    this.counterPer = counter
                    if(this.is_abs){
                        this.symbol = "%"
                    }
                    else{
                        this.symbol = this.currency

                    }
                // if(this.is_abs){
                //     let curentAbs = this.counter
                //     let baseval = this.base 
                //     if(this.counter < 0){
                //         this.counter = 0
                //     }
                //     //
                //     this.counterPer = this.convertPercent(baseval, curentAbs)
                //     // this.counter = this.counterPer
                //     this.symbol = "%"
                    

                // }
                // else{
                //     let percent = this.counter
                //     let baseval = this.base
                    
                //     this.counterPer = this.convertAbsolute(baseval , percent)
                //     if(this.counterPer < 0){
                //         this.counterPer = 0
                //     }
                //     // this.counter = this.counterPer
                //     this.symbol = this.currency

                // }
                this.onChange(this.counter)
               
                // }
                
                
               
            } 
            if (property === 'base') {
                this.counterPer = this.base
                

            }
        }
    }
 
         
   
    config = {
        weekDayFormat: 'd',
        weekDayFormatter: (num) => {
            if (num === 0) {
                return 'S';
            } else if (num === 1) {
                return 'M';
            } else if (num === 2) {
                return 'T';
            } else if (num === 3) {
                return 'W';
            } else if (num === 4) {
                return 'T';
            } else if (num === 5) {
                return 'F';
            } else if (num === 6) {
                return 'S';
            } else {
                return 'S';
            }
        },
    };
}
