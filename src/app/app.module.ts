import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { ProductCard3dComponent } from './products/product-card3d.component';
import { AboutComponent } from './about/about.component';
import { HeroCanvasComponent } from './hero-canvas/hero-canvas.component';
import { CursorThreadComponent } from './cursor-thread/cursor-thread.component';
import { KineticHeadlineComponent } from './kinetic-headline/kinetic-headline.component';
import { HorizontalGalleryComponent } from './horizontal-gallery/horizontal-gallery.component';
import { YarnTimelineComponent } from './yarn-timeline/yarn-timeline.component';
import { LoomComponent } from './loom/loom.component';
import { TiltDirective } from './directives/tilt.directive';
import { ScrollRevealDirective } from './directives/scroll-reveal.directive';
import { MagneticDirective } from './directives/magnetic.directive';
import { ApiService } from './services/api.service';
import { PatternLabComponent } from './pattern-lab/pattern-lab.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'lab', component: PatternLabComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductsComponent,
    ProductCard3dComponent,
    AboutComponent,
    TiltDirective,
    ScrollRevealDirective,
    HeroCanvasComponent,
    CursorThreadComponent,
    KineticHeadlineComponent,
    HorizontalGalleryComponent,
    MagneticDirective,
    YarnTimelineComponent,
    LoomComponent,
    PatternLabComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule {}