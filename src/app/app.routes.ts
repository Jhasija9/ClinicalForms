import { Routes } from '@angular/router';
import { VisitDataComponent } from './visit-data/visit-data.component';
import { WrittenDirectiveComponent } from './written-directive/written-directive.component';
import { VolumeCalculationComponent } from './volume-calculation/volume-calculation.component';
import { SmitComponent } from './smit/smit.component';
import { VialSlipComponent } from './vial-slip/vial-slip.component';
import { AttestDataComponent } from './attest-data/attest-data.component';
import { LargeLabelAttestDataComponent } from './large-label-attest-data/large-label-attest-data.component';
import { CoaAttestDataComponent } from './coa-attest-data/coa-attest-data.component';
import { VialAttestDataComponent } from './vial-attest-data/vial-attest-data.component';
import { SubjectIdComponent } from './subject-id/subject-id.component';
import { OrderingComponent } from './ordering/ordering.component';
import { FormOrderingComponent } from './form-ordering/form-ordering.component';
import { NuclearMedComponent } from './nuclear-med/nuclear-med.component';

export const routes: Routes = [
  { path: 'visit-data', component: VisitDataComponent },
  { path: '', redirectTo: '/visit-data', pathMatch: 'full' },
  { path: 'written-directive', component: WrittenDirectiveComponent },
  { path: 'volume-calculation', component: VolumeCalculationComponent },
  { path: 'smith', component: SmitComponent },
  { path: 'syringe', component: VialSlipComponent },
  {path: 'attest',
    loadComponent: () => import('./attest-data/attest-data.component')
      .then(m => m.AttestDataComponent)},
      {
        path: 'large-label',
        loadComponent: () => import('./large-label-attest-data/large-label-attest-data.component')
          .then(m => m.LargeLabelAttestDataComponent
          )
      },
      {
        path: '',
        redirectTo: 'attest',
        pathMatch: 'full'
      },
      { path: 'coa',
        loadComponent: () => import('./coa-attest-data/coa-attest-data.component')
          .then(m => m.CoaAttestDataComponent)
      },
      { path: 'vial', component: VialAttestDataComponent },
      { path: 'subject-id', component: SubjectIdComponent },
      {path:'ordering', component: OrderingComponent},
      {path:'form-order', component: FormOrderingComponent},
      {path:'nuclear-med', component: NuclearMedComponent}


    ];