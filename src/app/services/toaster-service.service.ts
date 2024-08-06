import { Injectable } from '@angular/core';
import { Overlay, ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private toastr: ToastrService,) { }

  overlay: Overlay;

  showToaster(toastrClass: string, message: string){
    switch (toastrClass) {
      case "info":
        this.toastr.info(message);
        break;
      case "success":
        this.toastr.success(message);
        break;
      case "warning":
        this.toastr.warning(message);
        break;
      case "error":
          this.toastr.error(message);
          break;  
      default: 
      this.toastr.success(message);
    }
    
}

}
