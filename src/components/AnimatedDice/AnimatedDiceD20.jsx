import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import styles from './AnimatedDiceD20.module.scss';

export const AnimatedDiceD20 = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 0, 150);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Предзагрузка текстуры логотипа (из public/img/logo.svg)
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load('/img/logoBlack.svg');
    logoTexture.colorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(60, 80, 120);
    scene.add(dirLight);

    const radius = 40;
    const geometry = new THREE.IcosahedronGeometry(radius, 0);
    const material = new THREE.MeshStandardMaterial({
      color: '#3ffbfb',
      metalness: 0.2,
      roughness: 0.85,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Рёбра должны вращаться вместе с мешем
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x333333 }),
    );
    edges.renderOrder = 1;
    mesh.add(edges);

    const labelsGroup = new THREE.Group();
    mesh.add(labelsGroup);

    // Хелпер: создаём текстовую плоскость для цифры
    function makeTextLabelPlane(text) {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, size, size);
      // прозрачный фон
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, size, size);

      // цифра
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 96px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, size / 2, size / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
      const labelSize = 23; // визуальный размер цифры на грани
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(labelSize, labelSize),
        mat,
      );
      return plane;
    }

    // Хелпер: создаём плоскость с логотипом для грани "20"
    function makeLogoPlane() {
      const mat = new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
      const labelSize = 15;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(labelSize, labelSize),
        mat,
      );
      return plane;
    }

    // Генерация цифр на каждой грани
    const posAttr = geometry.getAttribute('position');
    if (posAttr) {
      const positions = posAttr.array;
      const hasIndex = geometry.index && geometry.index.array;
      let faceNumber = 1;

      if (hasIndex) {
        const indices = geometry.index.array;
        for (let f = 0; f < indices.length; f += 3) {
          const a = indices[f] * 3;
          const b = indices[f + 1] * 3;
          const c = indices[f + 2] * 3;

          const v1 = new THREE.Vector3(
            positions[a],
            positions[a + 1],
            positions[a + 2],
          );
          const v2 = new THREE.Vector3(
            positions[b],
            positions[b + 1],
            positions[b + 2],
          );
          const v3 = new THREE.Vector3(
            positions[c],
            positions[c + 1],
            positions[c + 2],
          );

          const centroid = new THREE.Vector3()
            .add(v1)
            .add(v2)
            .add(v3)
            .multiplyScalar(1 / 3);
          const normal = new THREE.Vector3()
            .subVectors(v2, v1)
            .cross(new THREE.Vector3().subVectors(v3, v1))
            .normalize();

          const isLogo = faceNumber === 20;
          const labelPlane = isLogo
            ? makeLogoPlane()
            : makeTextLabelPlane(String(faceNumber));
          faceNumber++;

          const offset = 0.1;
          labelPlane.position
            .copy(centroid)
            .add(normal.clone().multiplyScalar(offset));
          const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            normal,
          );
          labelPlane.setRotationFromQuaternion(quat);

          labelsGroup.add(labelPlane);
        }
      } else {
        for (let i = 0; i < positions.length; i += 9) {
          const v1 = new THREE.Vector3(
            positions[i],
            positions[i + 1],
            positions[i + 2],
          );
          const v2 = new THREE.Vector3(
            positions[i + 3],
            positions[i + 4],
            positions[i + 5],
          );
          const v3 = new THREE.Vector3(
            positions[i + 6],
            positions[i + 7],
            positions[i + 8],
          );

          const centroid = new THREE.Vector3()
            .add(v1)
            .add(v2)
            .add(v3)
            .multiplyScalar(1 / 3);
          const normal = new THREE.Vector3()
            .subVectors(v2, v1)
            .cross(new THREE.Vector3().subVectors(v3, v1))
            .normalize();

          const isLogo = faceNumber === 20;
          const labelPlane = isLogo
            ? makeLogoPlane()
            : makeTextLabelPlane(String(faceNumber));
          faceNumber++;

          const offset = 1.8;
          labelPlane.position
            .copy(centroid)
            .add(normal.clone().multiplyScalar(offset));
          const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            normal,
          );
          labelPlane.setRotationFromQuaternion(quat);

          labelsGroup.add(labelPlane);
        }
      }
    } else {
      console.warn('IcosahedronGeometry: position attribute missing');
    }
    //вращение кубика
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      mesh.rotation.x += 0.00166;
      mesh.rotation.y += 0.00116;
      renderer.render(scene, camera);
    };
    animate();

    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      labelsGroup.children.forEach(child => {
        if (child.material && child.material.map) {
          child.material.map.dispose();
        }
        if (child.material) child.material.dispose();
      });
      geometry.dispose();
      material.dispose();
      edges.geometry.dispose();
      edges.material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={styles.d20Container} />;
};
