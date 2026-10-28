import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react';

interface TrustShield3DProps {
  threatLevel?: 'Low' | 'Moderate' | 'High' | 'Critical';
  interactive?: boolean;
}

export const TrustShield3D: React.FC<TrustShield3DProps> = ({
  threatLevel = 'Low',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [shieldMode, setShieldMode] = useState<'sentinel' | 'matrix' | 'core'>('sentinel');

  // Colors based on threat level
  const getThemeColor = () => {
    switch (threatLevel) {
      case 'Critical':
        return { primary: 0xf43f5e, glow: 0xff0055, ambient: 0x300510 };
      case 'High':
        return { primary: 0xf97316, glow: 0xff6b00, ambient: 0x301505 };
      case 'Moderate':
        return { primary: 0xeab308, glow: 0xffdd00, ambient: 0x201a05 };
      case 'Low':
      default:
        return { primary: 0x00f2fe, glow: 0x00c2ff, ambient: 0x071e2e };
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting rig (warm key, cool hemisphere fill, rim)
    const colors = getThemeColor();
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(colors.primary, 0x0b132b, 1.8);
    scene.add(fillLight);

    const backRimLight = new THREE.PointLight(colors.glow, 4.0, 15);
    backRimLight.position.set(-3, -2, -4);
    scene.add(backRimLight);

    // Create Composite 3D Trust Shield (4-Part Procedural Group)
    const shieldGroup = new THREE.Group();

    // 1. Procedural Shield Emblem Shape
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 2.0);
    shieldShape.quadraticCurveTo(1.6, 1.9, 1.7, 0.6);
    shieldShape.quadraticCurveTo(1.7, -0.8, 0, -2.1);
    shieldShape.quadraticCurveTo(-1.7, -0.8, -1.7, 0.6);
    shieldShape.quadraticCurveTo(-1.6, 1.9, 0, 2.0);

    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    };

    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    shieldGeometry.center();

    // Shield Outer Material
    const shieldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0d1829,
      emissive: colors.primary,
      emissiveIntensity: 0.25,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      wireframe: wireframe,
    });

    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldGroup.add(shieldMesh);

    // 2. Holographic Inner Plate / Insignia
    const innerShape = new THREE.Shape();
    innerShape.moveTo(0, 1.4);
    innerShape.quadraticCurveTo(1.1, 1.3, 1.15, 0.4);
    innerShape.quadraticCurveTo(1.15, -0.5, 0, -1.5);
    innerShape.quadraticCurveTo(-1.15, -0.5, -1.15, 0.4);
    innerShape.quadraticCurveTo(-1.1, 1.3, 0, 1.4);

    const innerGeo = new THREE.ShapeGeometry(innerShape);
    innerGeo.center();
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: colors.glow,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMaterial);
    innerMesh.position.z = 0.32;
    shieldGroup.add(innerMesh);

    // 3. Orbiting Cryptographic Security Ring
    const ringGeo = new THREE.TorusGeometry(2.7, 0.035, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: colors.primary,
      emissive: colors.primary,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMaterial);
    ringMesh1.rotation.x = Math.PI / 2.8;
    shieldGroup.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ringGeo, ringMaterial);
    ringMesh2.rotation.x = -Math.PI / 3.2;
    ringMesh2.rotation.y = Math.PI / 6;
    shieldGroup.add(ringMesh2);

    // 4. Data Particles Cloud
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: colors.glow,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    shieldGroup.add(particleSystem);

    scene.add(shieldGroup);

    // Mouse interaction for subtle parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.5;
      mouseY = y * 0.5;
    };

    container.addEventListener('mousemove', handlePointerMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Autonomous rotation + mouse tilt
      const speed = rotationSpeed;
      shieldGroup.rotation.y += delta * 0.45 * speed;
      ringMesh1.rotation.z += delta * 0.8 * speed;
      ringMesh2.rotation.z -= delta * 0.6 * speed;
      particleSystem.rotation.y -= delta * 0.15 * speed;

      // Floating undulation
      shieldGroup.position.y = Math.sin(time * 1.5) * 0.12;

      // Mouse smooth damping
      targetRotationY = mouseX * 0.6;
      targetRotationX = -mouseY * 0.4;
      shieldGroup.rotation.x = THREE.MathUtils.damp(shieldGroup.rotation.x, targetRotationX, 4, delta);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      shieldGeometry.dispose();
      shieldMaterial.dispose();
      innerGeo.dispose();
      innerMaterial.dispose();
      ringGeo.dispose();
      ringMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [threatLevel, wireframe, rotationSpeed, shieldMode]);

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0b132b]/80 via-[#070b14]/90 to-[#070b14] border border-cyan-500/20 shadow-[0_0_50px_rgba(0,242,254,0.08)] flex flex-col items-center justify-center">
      {/* 3D WebGL Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Spec Badge */}
      <div className="absolute top-3 left-4 flex items-center space-x-2 bg-[#070b14]/85 border border-cyan-500/30 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-300 pointer-events-none">
        <Shield className="w-3.5 h-3.5 text-cyan-400" />
        <span>TRUST-SHIELD-V4 // NEURAL AUTH</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block ml-1" />
      </div>

      {/* Threat Status Pill */}
      <div className="absolute top-3 right-4 bg-[#070b14]/85 border border-cyan-500/30 px-3 py-1.5 rounded-full text-xs font-mono">
        <span className="text-gray-400 mr-1.5">RADAR:</span>
        <span
          className={`font-semibold ${
            threatLevel === 'Critical'
              ? 'text-rose-400'
              : threatLevel === 'High'
              ? 'text-orange-400'
              : threatLevel === 'Moderate'
              ? 'text-yellow-400'
              : 'text-emerald-400'
          }`}
        >
          {threatLevel.toUpperCase()} RISK
        </span>
      </div>

      {/* Collapsible Unified Bottom Control Dock */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 transition-all duration-300 z-10 w-[92%] max-w-[540px] ${
          isZenMode ? 'translate-y-[calc(100%-26px)] opacity-60 hover:opacity-100' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Zen Toggle Handle */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="flex items-center space-x-1 bg-[#0b132b] text-cyan-400 text-[11px] font-mono px-3 py-0.5 rounded-t-lg border-t border-x border-cyan-500/30 hover:bg-cyan-950/40 cursor-pointer shadow-lg"
          >
            {isZenMode ? (
              <>
                <Eye className="w-3 h-3" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Zen Mode</span>
              </>
            )}
          </button>

          {/* Dock Body */}
          <div className="w-full bg-[#070b14]/95 border border-cyan-500/30 rounded-xl p-2.5 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 text-xs">
            {/* Mode Selector */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShieldMode('sentinel')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  shieldMode === 'sentinel'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sentinel
              </button>
              <button
                onClick={() => setShieldMode('matrix')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  shieldMode === 'matrix'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Matrix
              </button>
            </div>

            {/* Wireframe Toggle */}
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-2 py-1 rounded text-[11px] border transition-all flex items-center space-x-1 ${
                wireframe
                  ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{wireframe ? 'Mesh On' : 'Solid'}</span>
            </button>

            {/* Rotation Multiplier */}
            <div className="flex items-center space-x-1.5 text-gray-400 text-[11px]">
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <button
                onClick={() => setRotationSpeed(rotationSpeed === 1 ? 2 : rotationSpeed === 2 ? 0.5 : 1)}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:border-cyan-400/40 text-cyan-300 font-mono"
              >
                {rotationSpeed}x
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
