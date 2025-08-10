import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, ChangeDetectionStrategy, NgZone, Renderer2 } from '@angular/core';
import * as THREE from 'three';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-hero-canvas',
  templateUrl: './hero-canvas.component.html',
  styleUrls: ['./hero-canvas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('headline', { static: false }) headlineRef?: ElementRef<SVGSVGElement>;
  @ViewChild('cta', { static: false }) ctaRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('scrollCue', { static: false }) scrollCueRef?: ElementRef<HTMLDivElement>;

  staticMode = false;

  private renderer?: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera?: THREE.PerspectiveCamera;
  private fg?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private bg?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private particles?: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private raf = 0;
  private reduce = false;
  private mouse = new THREE.Vector2();
  private light = new THREE.Vector2(0.4, 0.6);
  private intersectionObserver?: IntersectionObserver;

  constructor(private settings: SettingsService, private ngZone: NgZone, private renderer2: Renderer2) {}

  ngAfterViewInit(): void {
    this.setupCTA();
    this.initHeadline();
    this.initScrollCue();

    this.reduce = this.settings.prefersReducedMotion();
    const canvas = this.canvasRef?.nativeElement;
    if (this.reduce || !canvas) {
      this.staticMode = true;
      return;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch {
      this.staticMode = true;
      return;
    }

    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.floor(rect.height || canvas.clientHeight || 1));
    this.renderer.setSize(width, height, false);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    const loader = new THREE.TextureLoader();
    const colorTex = loader.load('assets/knit/knit_color.jpg');
    const normalTex = loader.load('assets/knit/knit_normal.jpg');
    const maskTex = loader.load('assets/knit/stichi_mask.png');

    const geo = new THREE.PlaneGeometry(4, 2.5, 128, 64);

    const createMaterial = (offset: number) => new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: colorTex },
        uNormal: { value: normalTex },
        uMask: { value: maskTex },
        uLight: { value: new THREE.Vector2(0.4, 0.6) },
        uRipplePos: { value: new THREE.Vector2(-10, -10) },
        uRippleStrength: { value: 0 },
        uTugPos: { value: new THREE.Vector2(-10, -10) },
        uTugStrength: { value: 0 },
        uOffset: { value: offset }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uOffset;
        uniform sampler2D uMask;
        uniform vec2 uRipplePos;
        uniform float uRippleStrength;
        uniform vec2 uTugPos;
        uniform float uTugStrength;
        varying vec2 vUv;
        void main(){
          vUv = uv;
          vec3 pos = position;
          float wave = sin(pos.x*2.0 + uTime*0.4 + uOffset)*0.15;
          wave += sin(pos.y*1.5 + uTime*0.3 + uOffset)*0.15;
          pos.z += wave;
          float mask = texture2D(uMask, vUv).r;
          pos.z += mask*0.02;
          vec2 toRipple = pos.xy - uRipplePos;
          float d = length(toRipple);
          pos.z += uRippleStrength * sin(10.0*d - uTime*4.0) * exp(-4.0*d);
          vec2 toTug = pos.xy - uTugPos;
          float dt = length(toTug);
          pos.xy += toTug * uTugStrength * exp(-4.0*dt);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uColor;
        uniform sampler2D uNormal;
        uniform vec2 uLight;
        varying vec2 vUv;
        void main(){
          vec3 base = texture2D(uColor, vUv*4.0).rgb;
          vec3 nrm = texture2D(uNormal, vUv*4.0).xyz*2.0-1.0;
          vec3 lightDir = normalize(vec3(uLight,1.0));
          float diff = 0.6 + 0.4*dot(nrm, lightDir);
          gl_FragColor = vec4(base*diff,1.0);
        }
      `
    });

    this.fg = new THREE.Mesh(geo, createMaterial(0));
    this.bg = new THREE.Mesh(geo, createMaterial(1.0));
    this.bg.position.z = -0.05;
    this.scene.add(this.bg, this.fg);

    const pGeo = new THREE.BufferGeometry();
    const pCount = 80;
    const positions: number[] = [];
    for (let i = 0; i < pCount; i++) {
      positions.push((Math.random() - 0.5) * 4);
      positions.push((Math.random() - 0.5) * 2.5);
      positions.push(Math.random() * 0.5);
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.6 });
    this.particles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.particles);

    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
      this.mouse.set(x, y);
      this.light.set(x * 0.5 + 0.5, y * 0.5 + 0.5);
      (this.fg!.material.uniforms.uLight.value as THREE.Vector2).copy(this.light);
      (this.bg!.material.uniforms.uLight.value as THREE.Vector2).copy(this.light);
    });

    window.addEventListener('resize', () => this.onResize());
    this.onResize();
    this.observeVisibility();
    this.ngZone.runOutsideAngular(() => this.tick());
  }

  private observeVisibility() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        this.tick();
      } else {
        cancelAnimationFrame(this.raf);
      }
    });
    this.intersectionObserver.observe(canvas);
  }

  private tick = () => {
    if (!this.renderer || !this.camera || !this.fg || !this.bg) return;
    this.fg.material.uniforms.uTime.value += 0.01;
    this.bg.material.uniforms.uTime.value += 0.008;
    this.fg.material.uniforms.uRippleStrength.value *= 0.95;
    this.bg.material.uniforms.uRippleStrength.value *= 0.95;
    this.fg.material.uniforms.uTugStrength.value *= 0.9;
    this.bg.material.uniforms.uTugStrength.value *= 0.9;

    if (this.particles) {
      const pos = this.particles.geometry.attributes['position'] as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, pos.getY(i) + 0.0005);
        if (pos.getY(i) > 1.25) pos.setY(i, -1.25);
      }
      pos.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  private onResize() {
    if (!this.renderer || !this.camera || !this.canvasRef) return;
    const el = this.canvasRef.nativeElement;
    const rect = el.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width || el.clientWidth || 1));
    const h = Math.max(1, Math.floor(rect.height || el.clientHeight || 1));
    if (h === 0 || w === 0) return; // avoid invalid aspect
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private triggerRipple(vec: THREE.Vector2) {
    if (!this.fg || !this.bg) return;
    (this.fg.material.uniforms.uRipplePos.value as THREE.Vector2).copy(vec);
    (this.bg.material.uniforms.uRipplePos.value as THREE.Vector2).copy(vec);
    this.fg.material.uniforms.uRippleStrength.value = 0.15;
    this.bg.material.uniforms.uRippleStrength.value = 0.1;
  }

  private triggerTug(vec: THREE.Vector2) {
    if (!this.fg || !this.bg) return;
    (this.fg.material.uniforms.uTugPos.value as THREE.Vector2).copy(vec);
    (this.bg.material.uniforms.uTugPos.value as THREE.Vector2).copy(vec);
    this.fg.material.uniforms.uTugStrength.value = 0.15;
    this.bg.material.uniforms.uTugStrength.value = 0.1;
  }

  private setupCTA() {
    const btn = this.ctaRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!btn) return;
    const audio = new Audio('assets/audio/needle_ping.wav');

    btn.addEventListener('pointerenter', (e: PointerEvent) => {
      audio.currentTime = 0;
      void audio.play();
      if (canvas) {
        const pos = this.eventToPlane(e);
        this.triggerRipple(pos);
      }
    });
    btn.addEventListener('pointermove', (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      const strength = 0.3;
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
    btn.addEventListener('click', (e: MouseEvent) => {
      if (canvas) {
        const pos = this.eventToPlane(e);
        this.triggerTug(pos);
      }
    });
  }

  private eventToPlane(e: MouseEvent): THREE.Vector2 {
    const canvas = this.canvasRef!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 4 - 2;
    const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
    return new THREE.Vector2(x, y);
  }

  private initHeadline() {
    const svg = this.headlineRef?.nativeElement as SVGSVGElement | undefined;
    if (!svg) return;
    const text = svg.querySelector('text');
    if (!text || !(text as any).getComputedTextLength) return;
    const len = (text as unknown as SVGTextContentElement).getComputedTextLength();
    (text as SVGElement).style.setProperty('--dash', `${Math.floor(len)}`);
    setTimeout(() => {
      this.renderer2.addClass(text, 'stitched');
    }, 3000);
  }

  private initScrollCue() {
    const cue = this.scrollCueRef?.nativeElement;
    if (!cue) return;
    const hide = () => {
      this.renderer2.setStyle(cue, 'opacity', '0');
      window.removeEventListener('scroll', hide);
    };
    window.addEventListener('scroll', hide, { once: true });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.intersectionObserver?.disconnect();
    this.renderer?.dispose();
    this.fg?.geometry.dispose();
    this.bg?.geometry.dispose();
    this.fg?.material.dispose();
    this.bg?.material.dispose();
    this.particles?.geometry.dispose();
    (this.particles?.material as THREE.Material | undefined)?.dispose();
  }
}
