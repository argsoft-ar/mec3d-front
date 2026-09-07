import { Component, Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  Bounds,
  Center,
  Html,
  OrbitControls,
  useProgress,
} from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import * as THREE from "three";
import type { ModelViewer3DProps } from "../../interfaces";
import "./ModelViewer3D.css";

const SUPPORTED_FORMATS = ["STL", "OBJ", "3MF"] as const;
type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

// Matches the backend's upload cap (see mec3d-back upload.service.ts).
const MAX_MODEL_SIZE_BYTES = 30 * 1024 * 1024;

const HEAVY_FILE_MESSAGE =
  "Este archivo es muy pesado para previsualizar en el navegador. Descargalo para verlo en tu software CAD.";

const UNSUPPORTED_FORMAT_MESSAGE =
  "Vista previa no disponible para este formato. Descargá el archivo para verlo en tu software CAD.";

function isSupportedFormat(format: string): format is SupportedFormat {
  return (SUPPORTED_FORMATS as readonly string[]).includes(format);
}

type SizeGuardStatus = "checking" | "safe" | "blocked";

// Issues a HEAD request to read Content-Length before any loader touches the
// file. Pre-existing files uploaded before the 30MB cap existed can still be
// huge, and a missing/unreadable header is treated as "blocked" rather than
// "safe" — we'd rather show the download fallback than risk freezing the
// main thread while parsing an unexpectedly large model.
function useModelSizeGuard(url: string, enabled: boolean): SizeGuardStatus {
  const [status, setStatus] = useState<SizeGuardStatus>("checking");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setStatus("checking");

    fetch(url, { method: "HEAD" })
      .then((response) => {
        if (cancelled) return;
        const contentLength = response.headers.get("content-length");
        if (!response.ok || contentLength === null) {
          setStatus("blocked");
          return;
        }
        const size = Number(contentLength);
        setStatus(
          Number.isFinite(size) && size <= MAX_MODEL_SIZE_BYTES
            ? "safe"
            : "blocked",
        );
      })
      .catch(() => {
        if (!cancelled) setStatus("blocked");
      });

    return () => {
      cancelled = true;
    };
  }, [url, enabled]);

  return status;
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

function StlModel({ url }: Readonly<{ url: string }>) {
  const geometry = useLoader(STLLoader, url);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <mesh
      geometry={geometry} // NOSONAR - react-three-fiber intrinsic prop, not a DOM attribute
      castShadow // NOSONAR - react-three-fiber intrinsic prop, not a DOM attribute
      receiveShadow // NOSONAR - react-three-fiber intrinsic prop, not a DOM attribute
    >
      <meshStandardMaterial color="#9ca3af" />
    </mesh>
  );
}

function ObjModel({ url }: Readonly<{ url: string }>) {
  const object = useLoader(OBJLoader, url);

  useEffect(() => {
    return () => disposeObject3D(object);
  }, [object]);

  return <primitive object={object} />; // NOSONAR - react-three-fiber intrinsic prop, not a DOM attribute
}

function ThreeMfModel({ url }: Readonly<{ url: string }>) {
  const object = useLoader(ThreeMFLoader, url);

  useEffect(() => {
    return () => disposeObject3D(object);
  }, [object]);

  return <primitive object={object} />; // NOSONAR - react-three-fiber intrinsic prop, not a DOM attribute
}

interface SceneModelProps {
  url: string;
  format: SupportedFormat;
}

function SceneModel({ url, format }: Readonly<SceneModelProps>) {
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
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="model-viewer-3d__loading">
        Cargando modelo… {Math.round(progress)}%
      </div>
    </Html>
  );
}

function FallbackMessage({ text }: Readonly<{ text: string }>) {
  return (
    <div className="model-viewer-3d__fallback">
      <p className="model-viewer-3d__fallback-text">{text}</p>
    </div>
  );
}

function SizeCheckingIndicator() {
  return (
    <div className="model-viewer-3d__fallback">
      <div className="model-viewer-3d__loading">Comprobando el archivo…</div>
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
  const normalizedFormat = useMemo(() => format.trim().toUpperCase(), [format]);
  const formatIsSupported = isSupportedFormat(normalizedFormat);
  const sizeGuardStatus = useModelSizeGuard(url, formatIsSupported);

  if (!formatIsSupported) {
    return (
      <div className={`model-viewer-3d ${className}`.trim()}>
        <FallbackMessage text={UNSUPPORTED_FORMAT_MESSAGE} />
      </div>
    );
  }

  if (sizeGuardStatus === "checking") {
    return (
      <div className={`model-viewer-3d ${className}`.trim()}>
        <SizeCheckingIndicator />
      </div>
    );
  }

  if (sizeGuardStatus === "blocked") {
    return (
      <div className={`model-viewer-3d ${className}`.trim()}>
        <FallbackMessage text={HEAVY_FILE_MESSAGE} />
      </div>
    );
  }

  return (
    <div className={`model-viewer-3d ${className}`.trim()}>
      <ModelErrorBoundary fallback={<FallbackMessage text={UNSUPPORTED_FORMAT_MESSAGE} />}>
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [0, 0, 5], fov: 50 }}
        >
          <ambientLight intensity={0.6} />{" "}
          {/* NOSONAR - react-three-fiber intrinsic prop */}
          <directionalLight position={[5, 10, 7]} intensity={1} />{" "}
          {/* NOSONAR - react-three-fiber intrinsic props */}
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
