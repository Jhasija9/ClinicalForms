import { Routes } from '@angular/router';
import { VisitDataComponent } from './visit-data/visit-data.component';
import { WrittenDirectiveComponent } from './written-directive/written-directive.component';
import { VolumeCalculationComponent } from './volume-calculation/volume-calculation.component';
import { SmitComponent } from './smit/smit.component';

export const routes: Routes = [
  { path: 'visit-data', component: VisitDataComponent },
  { path: '', redirectTo: '/visit-data', pathMatch: 'full' },
  { path: 'written-directive', component: WrittenDirectiveComponent },
  { path: 'volume-calculation', component: VolumeCalculationComponent },
  { path: 'smith', component: SmitComponent }


];