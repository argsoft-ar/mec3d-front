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

const LOAD_FAILED_MESSAGE =
  "No se pudo cargar la vista previa. Descargá el archivo para verlo en tu software CAD.";

const UNSUPPORTED_FORMAT_MESSAGE =
  "Vista previa no disponible para este formato. Descargá el archivo para verlo en tu software CAD.";

function isSupportedFormat(format: string): format is SupportedFormat {
  return (SUPPORTED_FORMATS as readonly string[]).includes(format);
}

type ModelSourceStatus = "loading" | "ready" | "blocked" | "failed";

interface ModelSource {
  status: ModelSourceStatus;
  src: string | null;
}

// Signed (SigV4) URLs sign the HTTP method, so the size cannot be probed with HEAD and
// extra request headers are avoided. The file is downloaded once with a plain GET,
// aborting as soon as it exceeds the cap (declared Content-Length or bytes actually read);
// the loaders then parse the resulting blob URL without hitting the network again.
// Resolves to null when the file is over the cap.
async function fetchModelBlob(
  url: string,
  signal: AbortSignal,
): Promise<Blob | null> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_MODEL_SIZE_BYTES) {
    await response.body?.cancel();
    return null;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const blob = await response.blob();
    return blob.size <= MAX_MODEL_SIZE_BYTES ? blob : null;
  }

  const chunks: BlobPart[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_MODEL_SIZE_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new Blob(chunks);
}

function useModelSource(url: string, enabled: boolean): ModelSource {
  // Local files are already size-validated before their object URL is created.
  const isLocal = url.startsWith("blob:");
  const key = `${url}|${enabled}`;
  // Result is tagged with the inputs it was computed for, so a stale result
  // from a previous url/enabled pair is treated as "loading" during render
  // instead of resetting state imperatively from inside the effect.
  const [result, setResult] = useState<{ key: string } & ModelSource>({
    key,
    status: "loading",
    src: null,
  });

  useEffect(() => {
    if (!enabled || isLocal) return;
    const controller = new AbortController();
    let objectUrl: string | null = null;

    fetchModelBlob(url, controller.signal)
      .then((blob) => {
        if (blob === null) {
          setResult({ key, status: "blocked", src: null });
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setResult({ key, status: "ready", src: objectUrl });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ key, status: "failed", src: null });
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, enabled, isLocal, key]);

  if (enabled && isLocal) return { status: "ready", src: url };
  if (result.key !== key) return { status: "loading", src: null };
  return { status: result.status, src: result.src };
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
      <div className="model-viewer-3d__loading">Descargando el modelo…</div>
    </div>
  );
}

interface ModelErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
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

  componentDidCatch(): void {
    this.props.onError?.();
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function ModelViewer3D({
  url,
  format,
  className = "",
  onPreviewError,
}: ModelViewer3DProps) {
  const normalizedFormat = useMemo(() => format.trim().toUpperCase(), [format]);
  const formatIsSupported = isSupportedFormat(normalizedFormat);
  const { status: sourceStatus, src: modelSrc } = useModelSource(
    url,
    formatIsSupported,
  );

  useEffect(() => {
    if (!formatIsSupported) onPreviewError?.();
  }, [formatIsSupported, onPreviewError]);

  useEffect(() => {
    if (sourceStatus === "blocked" || sourceStatus === "failed") {
      onPreviewError?.();
    }
  }, [sourceStatus, onPreviewError]);

  if (!formatIsSupported) {
    return (
      <div className={`model-viewer-3d ${className}`.trim()}>
        <FallbackMessage text={UNSUPPORTED_FORMAT_MESSAGE} />
      </div>
    );
  }

  if (sourceStatus === "loading") {
    return (
      <div className={`model-viewer-3d ${className}`.trim()}>
        <SizeCheckingIndicator />
      </div>
    );
  }

  if (sourceStatus === "blocked" || sourceStatus === "failed" || !modelSrc) {
    return (
      <div className={`model-viewer-3d ${className}`.trim()}>
        <FallbackMessage
          text={
            sourceStatus === "blocked" ? HEAVY_FILE_MESSAGE : LOAD_FAILED_MESSAGE
          }
        />
      </div>
    );
  }

  return (
    <div className={`model-viewer-3d ${className}`.trim()}>
      <ModelErrorBoundary
        fallback={<FallbackMessage text={UNSUPPORTED_FORMAT_MESSAGE} />}
        onError={onPreviewError}
      >
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
                <SceneModel url={modelSrc} format={normalizedFormat} />
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
