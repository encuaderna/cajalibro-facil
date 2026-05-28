import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Visor 3D interactivo de la caja usando Three.js puro.
 * Soporta rotación por drag (mouse y touch) y zoom por rueda.
 * Las dimensiones están normalizadas para que encajen en el visor;
 * las proporciones reflejan fielmente las medidas reales de la caja.
 */
export default function BoxViewer3D({ boxType, dimensions, material }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth || 500;
    const H = el.clientHeight || 320;

    // ── Escena ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111620);

    // ── Cámara ──────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000);
    camera.position.set(1.8, 1.4, 2.2);
    camera.lookAt(0, 0, 0);

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    el.appendChild(renderer.domElement);

    // ── Iluminación ──────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir1 = new THREE.DirectionalLight(0xd0e8ff, 1.1);
    dir1.position.set(3, 5, 4);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0x4a9eff, 0.4);
    dir2.position.set(-3, -2, -3);
    scene.add(dir2);

    // ── Normalizar dimensiones ───────────────────────────────────────────────
    const t = material.thickness / 1000; // mm → m (escala relativa)
    const raw = {
      w: dimensions.ancho / 1000,
      h: dimensions.alto / 1000,
      d: dimensions.profundidad / 1000,
    };
    const maxDim = Math.max(raw.w, raw.h, raw.d);
    const scale = 1.0 / maxDim; // normalizar al mayor eje → 1
    const bw = raw.w * scale; // ancho normalizado
    const bh = raw.h * scale; // alto normalizado
    const bd = raw.d * scale; // profundidad normalizada
    const tk = (t * scale) * 8;  // grosor de pared visible (exagerado para claridad)

    // ── Materiales Three.js ──────────────────────────────────────────────────
    const matCard = new THREE.MeshStandardMaterial({
      color: 0x2a4a6a,
      roughness: 0.75,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const matEdge = new THREE.LineBasicMaterial({ color: 0x4a9eff, linewidth: 1 });
    const matHinge = new THREE.MeshStandardMaterial({
      color: 0x60c4ff,
      roughness: 0.4,
      metalness: 0.2,
    });
    const matBook = new THREE.MeshStandardMaterial({
      color: 0x1a2535,
      roughness: 0.8,
      metalness: 0.0,
    });
    const matSpine = new THREE.MeshStandardMaterial({
      color: 0x0e1825,
      roughness: 0.9,
    });

    // ── Helper: añade aristas wireframe a un mesh ────────────────────────────
    function addEdges(mesh) {
      const edges = new THREE.EdgesGeometry(mesh.geometry);
      const line = new THREE.LineSegments(edges, matEdge);
      mesh.add(line);
    }

    // ── Helper: crea un panel (caja delgada) y lo añade a la escena ──────────
    function panel(w, h, d, px, py, pz, mat = matCard) {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px, py, pz);
      scene.add(mesh);
      addEdges(mesh);
      return mesh;
    }

    // ── Helper: crea un grupo de caja cerrada (base + 4 lados) ──────────────
    function buildClosedBox(w, h, d, ox, oy, oz, mat = matCard) {
      const group = new THREE.Group();
      // Base
      panel(w, tk, d, ox, oy, oz);
      // Tapa
      panel(w, tk, d, ox, oy + h, oz);
      // Frente y fondo
      panel(w, h, tk, ox, oy + h / 2, oz + d / 2);
      panel(w, h, tk, ox, oy + h / 2, oz - d / 2);
      // Lados
      panel(tk, h, d, ox + w / 2, oy + h / 2, oz);
      panel(tk, h, d, ox - w / 2, oy + h / 2, oz);
      scene.add(group);
    }

    // ── Construir geometría según tipo de caja ──────────────────────────────
    const group = new THREE.Group();
    scene.add(group);

    if (boxType.id === "estuche") {
      // Caja abierta por el frente — 5 paneles (sin frente)
      panel(bw, tk, bd, 0, 0, 0);           // base
      panel(bw, tk, bd, 0, bh, 0);          // tapa
      panel(bw, bh, tk, 0, bh / 2, bd / 2);// fondo
      panel(tk, bh, bd, bw / 2, bh / 2, 0);// lado derecho
      panel(tk, bh, bd, -bw / 2, bh / 2, 0);// lado izquierdo
      // Libro asomando
      const bookW = bw * 0.85;
      const bookH = bh * 0.88;
      const bookD = bd * 0.88;
      panel(bookW, bookH, bookD * 0.2, 0, bh / 2, -bd / 2 - bookD * 0.1, matSpine);
      panel(bookW * 0.88, bookH * 0.95, bookD, 0, bh / 2, 0, matBook);

    } else if (boxType.id === "clamshell") {
      // Base cerrada
      panel(bw, tk, bd, 0, 0, 0);
      panel(bw, bh, tk, 0, bh / 2, bd / 2);
      panel(bw, bh, tk, 0, bh / 2, -bd / 2);
      panel(tk, bh, bd, bw / 2, bh / 2, 0);
      panel(tk, bh, bd, -bw / 2, bh / 2, 0);
      // Tapa abierta (rotada ~120° sobre el lomo izquierdo)
      const lidGroup = new THREE.Group();
      lidGroup.position.set(-bw / 2, bh, 0);
      // Paneles de la tapa en coordenadas locales del grupo
      const lidBase = new THREE.Mesh(new THREE.BoxGeometry(bw, tk, bd), matCard);
      lidBase.position.set(bw / 2, 0, 0);
      addEdges(lidBase);
      lidGroup.add(lidBase);
      const lidFront = new THREE.Mesh(new THREE.BoxGeometry(bw, bh * 0.7, tk), matCard);
      lidFront.position.set(bw / 2, bh * 0.35, bd / 2);
      addEdges(lidFront);
      lidGroup.add(lidFront);
      const lidBack = new THREE.Mesh(new THREE.BoxGeometry(bw, bh * 0.7, tk), matCard);
      lidBack.position.set(bw / 2, bh * 0.35, -bd / 2);
      addEdges(lidBack);
      lidGroup.add(lidBack);
      // Rotar la tapa hacia afuera
      lidGroup.rotation.z = -Math.PI * 0.55;
      scene.add(lidGroup);
      // Bisagra
      const hingeGeo = new THREE.CylinderGeometry(tk * 0.6, tk * 0.6, bd * 0.6, 12);
      const hinge = new THREE.Mesh(hingeGeo, matHinge);
      hinge.rotation.x = Math.PI / 2;
      hinge.position.set(-bw / 2, bh, 0);
      scene.add(hinge);

    } else if (boxType.id === "tapa_abatible") {
      // Caja base completa
      panel(bw, tk, bd, 0, 0, 0);
      panel(bw, bh, tk, 0, bh / 2, bd / 2);
      panel(bw, bh, tk, 0, bh / 2, -bd / 2);
      panel(tk, bh, bd, bw / 2, bh / 2, 0);
      panel(tk, bh, bd, -bw / 2, bh / 2, 0);
      // Tapa abatible (abierta, inclinada hacia atrás por el lado largo)
      const lidG2 = new THREE.Group();
      lidG2.position.set(0, bh, bd / 2);
      const lidP = new THREE.Mesh(new THREE.BoxGeometry(bw, tk, bd), matCard);
      lidP.position.set(0, 0, -bd / 2);
      addEdges(lidP);
      lidG2.add(lidP);
      lidG2.rotation.x = -Math.PI * 0.55;
      scene.add(lidG2);
      // Bisagra horizontal
      const hGeo = new THREE.CylinderGeometry(tk * 0.5, tk * 0.5, bw * 0.7, 12);
      const h2 = new THREE.Mesh(hGeo, matHinge);
      h2.position.set(0, bh, bd / 2);
      scene.add(h2);

    } else if (boxType.id === "tapa_separada") {
      // Mitad inferior
      const half = bh * 0.5;
      panel(bw, tk, bd, 0, 0, 0);
      panel(bw, half, tk, 0, half / 2, bd / 2);
      panel(bw, half, tk, 0, half / 2, -bd / 2);
      panel(tk, half, bd, bw / 2, half / 2, 0);
      panel(tk, half, bd, -bw / 2, half / 2, 0);
      // Mitad superior (tapa, elevada)
      const lift = bh * 0.18;
      panel(bw, tk, bd, 0, bh + lift, 0);
      panel(bw, half, tk, 0, half / 2 + half + lift, bd / 2);
      panel(bw, half, tk, 0, half / 2 + half + lift, -bd / 2);
      panel(tk, half, bd, bw / 2, half / 2 + half + lift, 0);
      panel(tk, half, bd, -bw / 2, half / 2 + half + lift, 0);

    } else if (boxType.id === "storbox") {
      // Caja completa robusta
      panel(bw, tk, bd, 0, 0, 0);
      panel(bw, tk, bd, 0, bh, 0);
      panel(bw, bh, tk, 0, bh / 2, bd / 2);
      panel(bw, bh, tk, 0, bh / 2, -bd / 2);
      panel(tk, bh, bd, bw / 2, bh / 2, 0);
      panel(tk, bh, bd, -bw / 2, bh / 2, 0);
      // Manillas (toros)
      const torusGeo = new THREE.TorusGeometry(bw * 0.1, tk * 0.4, 8, 20);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a9eff, roughness: 0.5 });
      const h1 = new THREE.Mesh(torusGeo, handleMat);
      h1.rotation.y = Math.PI / 2;
      h1.position.set(bw / 2 + tk, bh * 0.75, 0);
      scene.add(h1);
      const h2 = new THREE.Mesh(torusGeo, handleMat);
      h2.rotation.y = Math.PI / 2;
      h2.position.set(-bw / 2 - tk, bh * 0.75, 0);
      scene.add(h2);
    }

    // ── Centrar la caja verticalmente ────────────────────────────────────────
    scene.position.y = -bh / 2;

    // ── Grid helper sutil ────────────────────────────────────────────────────
    const grid = new THREE.GridHelper(4, 20, 0x1a2840, 0x1a2840);
    grid.position.y = -0.02;
    scene.add(grid);

    // ── Controles de órbita manual (mouse + touch) ───────────────────────────
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let rotX = 0.3, rotY = 0.5;
    let radius = camera.position.length();

    const updateCamera = () => {
      camera.position.x = radius * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = radius * Math.sin(rotX);
      camera.position.z = radius * Math.sin(rotY) * Math.sin(rotX) + radius * Math.cos(rotY) * 0.5;
      // simple orbit: spherical
      camera.position.x = radius * Math.cos(rotX) * Math.sin(rotY);
      camera.position.y = radius * Math.sin(rotX);
      camera.position.z = radius * Math.cos(rotX) * Math.cos(rotY);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onMouseDown = (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevX) * 0.012;
      rotX -= (e.clientY - prevY) * 0.009;
      rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));
      prevX = e.clientX; prevY = e.clientY;
      updateCamera();
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e) => {
      radius = Math.max(0.8, Math.min(6, radius + e.deltaY * 0.003));
      updateCamera();
    };

    // Touch
    let lastTouchDist = null;
    const onTouchStart = (e) => {
      if (e.touches.length === 1) { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }
      if (e.touches.length === 2) lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        rotY += (e.touches[0].clientX - prevX) * 0.015;
        rotX -= (e.touches[0].clientY - prevY) * 0.012;
        rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
        updateCamera();
      }
      if (e.touches.length === 2 && lastTouchDist !== null) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        radius = Math.max(0.8, Math.min(6, radius - (dist - lastTouchDist) * 0.005));
        lastTouchDist = dist;
        updateCamera();
      }
    };
    const onTouchEnd = () => { isDragging = false; lastTouchDist = null; };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    // ── Loop de renderizado ──────────────────────────────────────────────────
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      renderer.domElement.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [boxType.id, dimensions.alto, dimensions.ancho, dimensions.profundidad, material.thickness]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Vista 3D — {boxType.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Arrastra para rotar · Rueda para zoom
        </p>
      </div>
      <div
        ref={mountRef}
        style={{ width: "100%", height: 320, cursor: "grab" }}
        aria-label={`Visor 3D de ${boxType.name}`}
        role="img"
      />
    </div>
  );
}