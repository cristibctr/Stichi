import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three-stdlib/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three-stdlib/examples/jsm/postprocessing/UnrealBloomPass.js';

@Component({
  selector: 'app-hero-canvas',
  template: `<div class="absolute inset-0"><canvas #c class="w-full h-full block"></canvas></div>`
})
export class HeroCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('c', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private composer!: EffectComposer;
  private stars!: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private frame = 0;
  private raf = 0;
  private mouse = new THREE.Vector2(0,0);

  ngAfterViewInit(): void {
    const el = this.canvas.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(el.clientWidth, el.clientHeight, false);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 2000);
    this.camera.position.set(0, 0, 90);

    // Stars
    const count = 2000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 120 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 1.6,
      color: new THREE.Color('#e5989b').lerp(new THREE.Color('#6b705c'), 0.35),
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);

    // Post FX Bloom
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    const bloom = new UnrealBloomPass(new THREE.Vector2(el.clientWidth, el.clientHeight), 0.8, 0.8, 0.85);
    this.composer.addPass(bloom);

    // Events
    const resize = () => {
      const { clientWidth:w, clientHeight:h } = el;
      this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
      this.composer.setSize(w, h);
    };
    window.addEventListener('resize', resize);
    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.set((e.clientX-rect.left)/rect.width*2-1, -((e.clientY-rect.top)/rect.height*2-1));
    });
    resize();

    const tick = () => {
      this.frame += 0.005;
      // Subtle drift + parallax
      this.stars.rotation.y += 0.0007;
      this.camera.position.x += (this.mouse.x * 8 - this.camera.position.x) * 0.03;
      this.camera.position.y += (this.mouse.y * 6 - this.camera.position.y) * 0.03;
      this.camera.lookAt(0,0,0);
      this.composer.render();
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }
  ngOnDestroy(): void { cancelAnimationFrame(this.raf); this.renderer?.dispose(); }
}
