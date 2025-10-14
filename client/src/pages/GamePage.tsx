import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import GameBoard from "../components/GameBoard";
import { isXREnvironment } from "../utils/xr";

const GamePage = () => {
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    sphere: THREE.Mesh;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || isGameActive) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: false, // Disable antialiasing for better performance
      powerPreference: "low-power", // Prefer low-power GPU
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Cap pixel ratio at 1.5 for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Create sphere with wireframe material - reduced segments for better performance
    const geometry = new THREE.SphereGeometry(2, 16, 16); // Reduced from 32x32 to 16x16
    const material = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);

      sphere.rotation.x += 0.005;
      sphere.rotation.y += 0.01;

      renderer.render(scene, camera);

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };

    sceneRef.current = {
      scene,
      camera,
      renderer,
      sphere,
      animationId: 0,
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!sceneRef.current) return;

      const { camera, renderer } = sceneRef.current;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.renderer.dispose();
        sceneRef.current.scene.clear();
      }
    };
  }, [isGameActive]);

  const handleStartDuel = () => {
    setIsGameActive(true);
  };

  const handleEndDuel = () => {
    setIsGameActive(false);
  };

  if (isGameActive) {
    return <GameBoard gameMode={"ai-duel"} onEndGame={handleEndDuel} />;
  }

  const isXR = isXREnvironment();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ touchAction: "none" }}
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Title */}
        <div className="mb-12 text-center">
          <h1
            className="text-8xl font-bold tracking-wider mb-2"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "#f1f5f9",
              textShadow:
                "0 0 20px rgba(100, 116, 139, 0.5), 0 0 40px rgba(100, 116, 139, 0.3)",
            }}
          >
            WARLOK DUELS
          </h1>
          <div className="flex items-center justify-center gap-2">
            {[...Array(30)].map((_, i) => (
              <span key={i} className="text-slate-500 text-sm">
                #
              </span>
            ))}
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={handleStartDuel}
          className="pointer-events-auto relative group"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            className="relative px-24 py-8 border-2 border-slate-400 hover:border-slate-100 transition-all duration-300"
            style={{
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <span
              className="text-7xl font-bold tracking-widest group-hover:text-white transition-colors duration-300"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: "#f1f5f9",
                textShadow: "0 0 20px rgba(241, 245, 249, 0.5)",
              }}
            >
              PLAY
            </span>

            {/* Animated border effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow:
                  "0 0 30px rgba(100, 116, 139, 0.6), inset 0 0 20px rgba(100, 116, 139, 0.2)",
              }}
            />
          </div>
        </button>

        {/* Hash decoration at bottom */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <div className="border border-slate-700 px-8 py-3 backdrop-blur-sm bg-black/30">
            <div className="flex items-center gap-1">
              {[...Array(60)].map((_, i) => (
                <span key={i} className="text-slate-600 text-xs">
                  #
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* XR Mode Indicator */}
        {isXR && (
          <div className="absolute top-6 right-6 px-4 py-2 border border-slate-600 backdrop-blur-sm bg-black/50">
            <span className="text-slate-400 text-sm font-mono">XR MODE</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
