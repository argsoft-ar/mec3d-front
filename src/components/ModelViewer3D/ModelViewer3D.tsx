import { Component, Suspense, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Bounds, Center, Html, OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import * as THREE from "three";
import type { ModelViewer3DProps } from "../../interfaces";
import "./ModelViewer3D.css";

const SUPPORTED_FORMATS = ["STL", "OBJ", "3MF"] as const;
type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

function isSupportedFormat(format: string): format is SupportedFormat {
  return (SUPPORTED_FORMATS as readonly string[]).includes(format);
}

function disposeObject3D(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry?.dispose();
    const material = child.material;
    if (Array.isArray(material)) {
      material.forEach((m) => m.dispose());
    } else {
      material?.dispose();
    }
  });
}

function StlModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#9ca3af" />
    </mesh>
  );
}

function ObjModel({ url }: { url: string }) {
  const object = useLoader(OBJLoader, url);

  useEffect(() => {
    return () => disposeObject3D(object);
  }, [object]);

  return <primitive object={object} />;
}

function ThreeMfModel({ url }: { url: string }) {
  const object = useLoader(ThreeMFLoader, url);

  useEffect(() => {
    return () => disposeObject3D(object);
  }, [object]);

  return <primitive object={object} />;
}

interface SceneModelProps {
  url: string;
  format: SupportedFormat;
}

function SceneModel({ url, format }: SceneModelProps) {
  switch (format) {
    case "STL":
      return <StlModel url={url} />;
    case "OBJ":
      return <ObjModel url={url} />;
    case "3MF":
      return <ThreeMfModel url={url} />;
  }
}

function CanvasLoader() {
  return (
    <Html center>
      <div className="model-viewer-3d__loading">Cargando modelo…</div>
    </Html>
  );
}

function UnsupportedFormatMessage() {
  return (
    <div className="model-viewer-3d__fallback">
      <p className="model-viewer-3d__fallback-text">
        Vista previa no disponible para este formato. Descargá el archivo
        para verlo en tu software CAD.
      </p>
    </div>
  );
}

interface ModelErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
}

// Catches load/parse errors thrown by useLoader inside the Canvas subtree.
class ModelErrorBoundary extends Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  state: ModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function ModelViewer3D({ url, format, className = "" }: ModelViewer3DProps) {
  const normalizedFormat = useMemo(
    () => format.trim().toUpperCase(),
    [format],
  );

  if (!isSupportedFormat(normalizedFormat)) {
    return (
      <div className={`model-viewer-3d ${className}`.trim()}>
        <UnsupportedFormatMessage />
      </div>
    );
  }

  return (
    <div className={`model-viewer-3d ${className}`.trim()}>
      <ModelErrorBoundary fallback={<UnsupportedFormatMessage />}>
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [0, 0, 5], fov: 50 }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 7]} intensity={1} />
          <Suspense fallback={<CanvasLoader />}>
            <Bounds fit clip observe margin={1.2}>
              <Center>
                <SceneModel url={url} format={normalizedFormat} />
              </Center>
            </Bounds>
          </Suspense>
          <OrbitControls makeDefault enableDamping />
        </Canvas>
      </ModelErrorBoundary>
    </div>
  );
}

export default ModelViewer3D;
