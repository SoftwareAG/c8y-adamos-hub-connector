import { Component, ViewChild } from "@angular/core";
import { AdamosHubService } from "../shared/adamosHub.service";
import { BehaviorSubject, combineLatest } from "rxjs";
import { IHubResponse } from "../shared/model/IHubResponse";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { IEventRule } from "../shared/model/IEventRule";
import { ModalService, Status, _ } from "@c8y/ngx-components";
import { capitalize } from "lodash-es";

/*
 * Lists all devices of the current tenant with the posibility to add or remove Hub-Settings.
 */
@Component({
  selector: "eventRules",
  templateUrl: "./eventRules-list.component.html",
})
export class EventRulesListComponent {
  title: string = "Events";
  mappings: Array<IHubResponse<any>>;
  informationText: string;
  defaultMappingId: string;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  eventRules: any; // TODO: initialize and model out
  direction: any; // TODO: initialize and model out

  changed: boolean;

  @ViewChild("dlgRule") dlgRule: any;
  modalRef: BsModalRef;
  selectedRule: IEventRule;
  private _tempCopyRule: IEventRule;

  constructor(
    private hubService: AdamosHubService,
    private bsModalService: BsModalService,
    private modalService: ModalService
  ) {
    // _ annotation to mark this string as translatable string.
    this.informationText = _(
      "Ooops! It seems that there is no device to display."
    );
    // this.loadMappings();
    this.loadEventRules(this.direction);
  }

  onClickDelete(rule: IEventRule) {
    this.eventRules.rules.splice(this.eventRules.rules.indexOf(rule), 1);
    this.changed = true;
  }

  onClickDuplicate(rule: IEventRule) {
    this.eventRules.rules.splice(
      this.eventRules.rules.indexOf(rule) + 1,
      0,
      AdamosHubService.duplicateEventRule(rule)
    );
    this.changed = true;
  }

  onClickAdd() {
    this.selectedRule = AdamosHubService.createEventRule();
    this.modalRef = this.bsModalService.show(this.dlgRule);
  }

  openTogglStatusModal(rule: IEventRule) {
    const action = rule.enabled ? "deactivate" : "activate";
    const title = rule.name;
    const body = _(`Are you sure you want to ${action} this rule?`);
    const labels = {
      ok: _(capitalize(action)),
    };

    rule.enabled = !rule.enabled;
    this.modalService.confirm(title, body, Status.INFO, labels).then(
      () => (this.changed = true),
      () => (rule.enabled = !rule.enabled)
    );
  }

  private array_move(arr: unknown[], old_index: number, new_index: number) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  }

  onClickMoveUp(rule: any) {
    this.changed = true;
    this.array_move(
      this.eventRules.rules,
      this.eventRules.rules.indexOf(rule),
      this.eventRules.rules.indexOf(rule) - 1
    );
  }

  onClickMoveDown(rule: any) {
    this.changed = true;
    this.array_move(
      this.eventRules.rules,
      this.eventRules.rules.indexOf(rule),
      this.eventRules.rules.indexOf(rule) + 1
    );
  }

  async loadEventRules(direction: string) {
    this.changed = false;
    this.isLoading$.next(true);
    this.hubService.getEventRules$(direction).subscribe((data) => {
      this.eventRules = data;
      this.isLoading$.next(false);
    });
  }

  async loadMappings() {
    this.isLoading$.next(true);

    combineLatest(
      this.hubService.getMappings$(),
      this.hubService.getGlobalSettings$(),
      (mappings: Array<IHubResponse<any>>, globalSettings: any) => ({
        mappings,
        globalSettings,
      })
    ).subscribe((data) => {
      this.mappings = data.mappings;
      this.defaultMappingId = data.globalSettings.defaultMappingId;
      this.isLoading$.next(false);
    });
  }

  onClickEditRule(rule: any) {
    // Clone the object to be able to undo changes later
    this._tempCopyRule = AdamosHubService.cloneObject(rule);
    this.selectedRule = rule;
    this.modalRef = this.bsModalService.show(this.dlgRule);
  }

  onEditCancelClick() {
    if (
      this.eventRules?.rules &&
      this.eventRules.rules.indexOf(this.selectedRule) >= 0
    ) {
      // Undo changes
      this.eventRules.rules[this.eventRules.rules.indexOf(this.selectedRule)] =
        this._tempCopyRule;
    }
    this.modalRef.hide();
  }

  onSaveChanges() {
    this.changed = false;
    this.isLoading$.next(true);
    this.hubService.updateEventRules$(this.eventRules).subscribe(
      (data) => {
        this.isLoading$.next(false);
      },
      (error: any) => {
        this.changed = true;
        this.isLoading$.next(false);
      }
    );
  }

  onEditOKClick() {
    this.changed = !AdamosHubService.equalObjects(
      this.selectedRule,
      this._tempCopyRule
    );
    this._tempCopyRule = null;
    if (this.eventRules.rules.indexOf(this.selectedRule) < 0) {
      this.eventRules.rules.push(this.selectedRule);
    }
    this.modalRef.hide();
  }

  onRefresh() {
    //this.loadMappings();
    this.loadEventRules(this.direction);
  }

  private checkRuleMandatoryFileds(rule: IEventRule) {
    var result: boolean =
      rule.name.trim().length > 0 &&
      rule.id.trim().length > 0 &&
      rule.eventProcessor.channel.trim().length > 0 &&
      rule.eventProcessor.processingMode.trim().length > 0;

    return result;
  }

  mandatoryFieldsFilled(): boolean {
    return this.checkRuleMandatoryFileds(this.selectedRule);
  }
}
