import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-hero-canvas',
  template: `<div class="absolute inset-0"><canvas #c class="w-full h-full block"></canvas></div>`
})
export class HeroCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('c', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private material!: THREE.ShaderMaterial;
  private plane!: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private maskTex!: THREE.Texture;
  private raf = 0;
  private mouse = new THREE.Vector2();
  private reduce = false;

  constructor(private settings: SettingsService) {}

  ngAfterViewInit(): void {
    const el = this.canvas.nativeElement;
    this.reduce = this.settings.prefersReducedMotion();

    this.renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(el.clientWidth, el.clientHeight, false);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    const geo = new THREE.PlaneGeometry(4, 2.5, 128, 64);
    const colorTex = this.makeKnitTexture('#e6d5c3');
    const normalTex = this.makeNormalTexture();
    this.maskTex = this.makeMaskTexture();

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWind: { value: this.reduce ? 0.0 : 0.25 },
        uIntensity: { value: 0.4 },
        uColor: { value: colorTex },
        uNormal: { value: normalTex },
        uMask: { value: this.maskTex },
        uGloss: { value: 0.3 }
      },
      vertexShader: `
        uniform float uTime; 
        uniform float uWind; 
        uniform float uIntensity; 
        varying vec2 vUv; 
        void main(){
          vUv = uv; 
          vec3 pos = position; 
          float n = sin(pos.x*3.0 + uTime*0.5) * sin(pos.y*2.0 + uTime*0.3);
          pos.z += n * uIntensity; 
          pos.z += sin((pos.x+pos.y+uTime*0.2)*2.0) * uWind; 
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0); 
        }
      `,
      fragmentShader: `
        uniform sampler2D uColor; 
        uniform sampler2D uNormal; 
        uniform sampler2D uMask; 
        uniform float uGloss; 
        varying vec2 vUv; 
        void main(){
          vec3 color = texture2D(uColor, vUv*4.0).rgb; 
          vec3 nrm = texture2D(uNormal, vUv*4.0).xyz*2.0-1.0; 
          vec3 lightDir = normalize(vec3(0.4,0.6,1.0)); 
          float diff = 0.6 + 0.4 * dot(nrm, lightDir); 
          float spec = pow(max(dot(reflect(-lightDir, nrm), vec3(0,0,1)),0.0), 16.0)*uGloss; 
          float mask = texture2D(uMask, vUv).r; 
          color = mix(color*0.7, color, 1.0-mask); 
          spec *= (1.0-mask); 
          gl_FragColor = vec4(color*diff + spec, 1.0); 
        }
      `
    });

    this.plane = new THREE.Mesh(geo, this.material);
    this.scene.add(this.plane);

    if (!this.reduce) {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        this.mouse.set(
          (e.clientX - rect.left) / rect.width * 2 - 1,
          -((e.clientY - rect.top) / rect.height * 2 - 1)
        );
      });
    }

    window.addEventListener('resize', () => this.onResize());
    this.onResize();
    this.tick();
  }

  private tick = () => {
    this.material.uniforms.uTime.value += 0.01;
    if (!this.reduce) {
      this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.05;
      this.camera.position.y += (this.mouse.y * 0.3 - this.camera.position.y) * 0.05;
      this.camera.lookAt(0, 0, 0);
    }
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  private onResize() {
    const el = this.canvas.nativeElement;
    const { clientWidth: w, clientHeight: h } = el;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private makeKnitTexture(color: string): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#d1bfae';
    for (let y = 0; y < 64; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(64, y+4);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  private makeNormalTexture(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = c.height = 2;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'rgb(128,128,255)';
    ctx.fillRect(0, 0, 2, 2);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  private makeMaskTexture(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 120px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Stichi', c.width/2, c.height/2);
    return new THREE.CanvasTexture(c);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.renderer?.dispose();
    this.material?.dispose();
    this.plane?.geometry.dispose();
    this.maskTex?.dispose();
  }
}
