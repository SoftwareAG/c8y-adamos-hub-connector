import { NgModule } from "@angular/core";
import { CoreModule, HOOK_ROUTE } from "@c8y/ngx-components";
import { FormsModule } from "@angular/forms";
import { routes } from "./routes";
import { SharedModule } from "../shared/shared.module";
import { AdamosHubService } from "../shared/adamosHub.service";
import { EventRulesListComponent } from "./eventRules-list.component";
import { EventRulesToHubComponent } from "./event-rules-to-hub.component";
import { MappingModalComponent } from "./mapping-modal.component";

/*
 * Defines a module for the device-management.
 */
@NgModule({
  imports: [CoreModule, FormsModule, SharedModule],
  declarations: [EventRulesListComponent, EventRulesToHubComponent, MappingModalComponent],
  exports: [EventRulesListComponent],
  providers: [
    AdamosHubService,
    {
      provide: HOOK_ROUTE,
      useValue: routes,
      multi: true,
    },
  ],
})
export class EventRulesModule {}
