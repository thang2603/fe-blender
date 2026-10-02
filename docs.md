# Kiến trúc Web 3D Editor (React Three Fiber)

Tài liệu tổng hợp kiến trúc frontend, cấu trúc dữ liệu, và các vấn đề cần lưu ý khi xây dựng web editor sắp xếp khối 3D (kiểu Blender rút gọn: move/rotate/scale, không chỉnh sửa mesh), tối ưu bằng instanced mesh.

---

## 1. Cấu trúc thư mục Frontend

```
src/
├── main.tsx
├── App.tsx
│
├── core/                          # Logic lõi, không phụ thuộc React
│   ├── scene/
│   │   ├── SceneGraph.ts          # Danh sách object (flat, không cha-con)
│   │   └── SceneSerializer.ts     # Serialize/deserialize scene <-> JSON (DB)
│   ├── history/
│   │   ├── CommandManager.ts      # Undo/redo (command pattern)
│   │   └── commands/
│   │       ├── AddObjectCommand.ts
│   │       ├── DeleteObjectCommand.ts
│   │       ├── TransformCommand.ts
│   │       └── DuplicateCommand.ts




│   ├── instancing/
│   │   ├── InstanceBuffer.ts      # Float32Array (SoA) cho transform
│   │   └── InstanceManager.ts     # id <-> slot, free-list, dirty-flag
│   └── utils/
│       ├── math.ts
│       └── raycast.ts
│
├── state/                         # Zustand store
│   ├── useSceneStore.ts           # Metadata object (name, type, locked, visible)
│   ├── useSelectionStore.ts       # Object đang chọn
│   ├── useTransformStore.ts       # Mode: translate/rotate/scale
│   ├── useEditorSettingsStore.ts  # Snap, grid, gizmo size
│   └── useHistoryStore.ts
│
├── canvas/                        # Render R3F
│   ├── Viewport.tsx
│   ├── controls/
│   │   ├── OrbitCameraControls.tsx
│   │   └── ViewportShortcuts.tsx
│   ├── gizmo/
│   │   ├── TransformGizmo.tsx     # Proxy object + TransformControls
│   │   └── SelectionOutline.tsx
│   ├── grid/
│   │   └── EditorGrid.tsx
│   ├── objects/
│   │   ├── InstancedGroup.tsx     # 1 InstancedMesh / group geometry+material
│   │   └── PrimitiveFactory.ts
│   └── picking/
│       └── ClickToSelect.tsx      # Raycast -> instanceId -> objectId
│
├── ui/
│   ├── layout/
│   │   ├── EditorLayout.tsx
│   │   ├── Toolbar.tsx
│   │   └── StatusBar.tsx
│   ├── panels/
│   │   ├── SceneHierarchyPanel.tsx  # Danh sách object (flat list)
│   │   ├── InspectorPanel.tsx       # Chỉnh số position/rotation/scale
│   │   ├── MaterialPanel.tsx
│   │   └── AssetLibraryPanel.tsx
│   └── components/
│       ├── NumberInput.tsx
│       ├── Vector3Input.tsx
│       └── ContextMenu.tsx
│
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   ├── useTransformSync.ts        # Đồng bộ proxy object <-> InstanceBuffer
│   └── useAutoSave.ts             # Debounce + batch update lên BE
│
└── types/
    ├── scene.d.ts
    └── editor.d.ts
```

---

## 2. Nguyên tắc tổ chức dữ liệu (Runtime)

### 2.1 Tách 2 loại dữ liệu theo tần suất thay đổi

| Loại dữ liệu                          | Nơi lưu                               | Tần suất update         | Có trigger React re-render? |
| ------------------------------------- | ------------------------------------- | ----------------------- | --------------------------- |
| Transform (position/rotation/scale)   | `Float32Array` trong `InstanceBuffer` | Mỗi frame khi kéo gizmo | Không                       |
| Selection hiện tại                    | Zustand                               | Khi click chọn          | Có (ít)                     |
| Metadata (tên, loại, locked, visible) | Zustand                               | Khi sửa trong Inspector | Có                          |
| History (undo/redo)                   | Snapshot/diff ngoài React             | Khi commit action       | Không                       |

**Nguyên tắc quan trọng nhất:** không đưa transform vào React state (Zustand/Redux) vì sẽ gây re-render toàn bộ UI mỗi khi kéo chuột. Transform phải đi thẳng vào GPU buffer, bypass React.

### 2.2 Structure of Arrays (SoA) thay vì Array of Objects (AoS)

```ts
// ❌ AoS - cache miss nhiều, khó map trực tiếp vào GPU buffer
objects: [{ id, position: {x,y,z}, rotation: {...} }, ...]

// ✅ SoA - liền mạch trong bộ nhớ, gần như memcpy khi ghi vào instancedMesh
class InstanceBuffer {
  positions: Float32Array;   // length = capacity * 3
  quaternions: Float32Array; // length = capacity * 4
  scales: Float32Array;      // length = capacity * 3
}
```

### 2.3 InstanceManager: id ↔ slot + free-list

- Mỗi object logic (`objectId`) map tới 1 `slot` trong buffer qua `Map<string, number>`.
- Khi xoá object: không dịch chuyển mảng, chỉ đánh dấu slot vào `freeSlots` để tái sử dụng cho object mới → tránh O(n) re-index.
- Khi thêm object mới: ưu tiên lấy từ `freeSlots` trước khi cấp slot mới.

### 2.4 Gom nhóm theo geometry + material

```ts
instanceGroups: Map<
  string,
  {
    mesh: THREE.InstancedMesh;
    buffer: InstanceBuffer;
    manager: InstanceManager;
  }
>;
// key ví dụ: "box_matWood", "sphere_matMetal"
```

Đổi material của 1 object = chuyển object đó sang group khác (chấp nhận được vì không xảy ra mỗi frame).

### 2.5 Dirty-flag + batch update trong render loop

```ts
useFrame(() => {
  if (dirtySlots.size === 0) return; // không có gì đổi -> bỏ qua hoàn toàn
  for (const slot of dirtySlots) {
    mesh.setMatrixAt(slot, computeMatrix(slot));
  }
  mesh.instanceMatrix.needsUpdate = true; // chỉ gọi 1 lần / frame
  dirtySlots.clear();
});
```

### 2.6 Gizmo dùng Proxy Object

Vì object là instance (không phải mesh riêng), gắn `TransformControls` vào 1 `Object3D` ảo (proxy), sau đó đồng bộ giá trị proxy về lại `InstanceBuffer` qua `InstanceManager.updatePosition/...`.

### 2.7 Picking (raycast) với instance

- Raycast trả `instanceId` → cần map ngược `instanceId -> objectId` (lưu trong `InstanceManager`).
- Với số lượng lớn (>5,000 instance), nên dùng BVH (`three-mesh-bvh`) hoặc bounding sphere để early-reject, tránh raycast test toàn bộ instance.

---

## 3. Cấu trúc dữ liệu lưu trữ (Backend / MongoDB)

### 3.1 Nguyên tắc

Không lưu Float32Array trực tiếp vào DB. Runtime (SoA, Float32Array) chỉ là chi tiết tối ưu phía client. Khi lưu trữ/truyền tải, luôn serialize về JSON dạng array of objects thông thường.

### 3.2 Schema (mỗi object là 1 document, không có cha-con)

```js
// Collection: scene_objects
{
  _id: ObjectId("..."),
  sceneId: "scene_1",
  objectId: "box_42",         // id logic dùng ở client, do client tự sinh (UUID)
  type: "box",                 // "box" | "sphere" | "cylinder" | ...
  materialId: "mat_wood",
  transform: {
    position: [0, 1, 0],
    rotation: [0, 0, 0, 1],    // quaternion
    scale: [1, 1, 1]
  },
  name: "Box 42",
  visible: true,
  locked: false,
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

### 3.3 Index bắt buộc

```js
db.scene_objects.createIndex({ sceneId: 1 });
db.scene_objects.createIndex({ sceneId: 1, objectId: 1 }, { unique: true });
```

### 3.4 Các thao tác chính

| Thao tác                    | Query                                               |
| --------------------------- | --------------------------------------------------- |
| Load scene                  | `find({ sceneId })` — 1 query duy nhất              |
| Update 1 object             | `updateOne({ sceneId, objectId }, { $set: {...} })` |
| Batch update (multi-select) | `bulkWrite([...])` — gộp nhiều update, 1 round-trip |
| Thêm object                 | `insertOne({...})`                                  |
| Xoá object                  | `deleteOne({ sceneId, objectId })`                  |

### 3.5 Vì sao MongoDB phù hợp

- Document model khớp tự nhiên với object có field thay đổi theo loại (box/sphere/custom).
- Không cần JOIN vì không có quan hệ cha-con.
- BSON hỗ trợ tốt nested object/array (transform, materials).

### 3.6 Giới hạn cần lưu ý

- Giới hạn document 16MB không phải vấn đề ở đây vì mỗi object là 1 document riêng (đã tách sẵn).
- Nếu scene có hàng chục nghìn object: cân nhắc pagination/cursor khi load, hoặc field projection (`.project({...})`) nếu UI không cần load hết field cùng lúc.
- Nếu cần collaborative editing realtime (nhiều người sửa cùng lúc): MongoDB chỉ nên đóng vai trò lưu snapshot định kỳ; state realtime nên qua WebSocket/CRDT (vd Yjs), không dùng MongoDB làm nguồn sự thật tức thời.

---

## 4. Luồng dữ liệu tổng thể (Data Flow)

```
Runtime (client): Float32Array (SoA)
   - Tối ưu render, ghi trực tiếp GPU buffer (instancedMesh.setMatrixAt)
   - Update mỗi frame khi kéo gizmo, KHÔNG qua React state
        │
        │ (debounce ~800ms, chỉ trigger khi ngừng kéo / thả chuột)
        ▼
Patch object: { objectId, transform: {...} }
        │
        │ (gộp nhiều thay đổi nếu multi-select)
        ▼
API batch-update (POST /scenes/:sceneId/objects/batch-update)
        │
        ▼
MongoDB: bulkWrite - mỗi object 1 document phẳng, index theo sceneId
```

---

## 5. Undo/Redo

- Dùng **Command Pattern**: mỗi thao tác (add/delete/transform/duplicate) là 1 object có `execute()` và `undo()`.
- Chỉ commit 1 command khi thao tác **hoàn tất** (vd: thả chuột sau khi kéo), không commit từng frame khi đang kéo.
- History sống ngoài React (hoặc trong 1 store riêng chỉ lưu index hiện tại để UI hiển thị enable/disable nút Undo/Redo).

---

## 6. Autosave (Debounce + Batch)

```ts
const pendingChanges = new Map<string, Partial<SceneObjectDTO>>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function queueSave(objectId: string, patch: Partial<SceneObjectDTO>) {
  pendingChanges.set(objectId, { ...pendingChanges.get(objectId), ...patch });
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 800);
}

async function flushSave() {
  if (pendingChanges.size === 0) return;
  const changes = Array.from(pendingChanges.entries());
  pendingChanges.clear();
  await api.post(`/scenes/${sceneId}/objects/batch-update`, { changes });
}
```

Nguyên tắc: chỉ gọi `queueSave` tại `onDragEnd`, tuyệt đối không gọi trong `useFrame`/khi đang kéo.

---

## 7. Danh sách các vấn đề cần đặc biệt lưu ý

1. **Không đưa transform vào React state** — nguyên nhân phổ biến nhất gây giật lag khi scene có nhiều object.
2. **Dùng SoA (Float32Array), không dùng AoS** cho dữ liệu transform runtime.
3. **Free-list khi xoá object** — tránh re-index toàn bộ mảng mỗi lần xoá.
4. **Dirty-flag + batch update trong `useFrame`** — chỉ update slot thay đổi, tránh gọi `needsUpdate` thừa.
5. **Proxy object cho gizmo** — vì object thật là instance, không phải mesh riêng để gắn `TransformControls` trực tiếp.
6. **Raycast với instance cần map `instanceId -> objectId`**, và cân nhắc BVH khi số lượng instance lớn.
7. **Không lưu Float32Array vào DB** — luôn serialize về JSON array of object thông thường.
8. **Tách object thành collection riêng** (`scene_objects`) thay vì nhồi vào 1 document scene lớn — cho phép partial update, tránh giới hạn 16MB.
9. **Debounce + batch API call khi autosave** — tuyệt đối không gọi API mỗi frame khi đang kéo.
10. **Optimistic locking** (dựa vào `updatedAt` hoặc version field) nên cân nhắc nếu nhiều người có thể sửa cùng 1 object cùng lúc, để tránh ghi đè lẫn nhau.
11. **Web Worker** nên cân nhắc nếu scene có thể lên tới hàng chục nghìn object, để tính toán transform/collision ngoài main thread, chỉ transfer `ArrayBuffer` (zero-copy) về render.
12. **Field projection / pagination** khi load scene rất lớn để giảm thời gian query + transfer JSON.

---

## 8. Hướng mở rộng trong tương lai (nếu cần)

- **Realtime collaborative editing**: thêm lớp CRDT (Yjs) + WebSocket, MongoDB chỉ lưu snapshot định kỳ.
- **Đổi sang Postgres + JSONB**: nếu về sau cần query quan hệ phức tạp (thống kê, báo cáo liên scene/material) mà MongoDB không thuận tiện bằng SQL JOIN.
- **Version/schema migration**: thêm field `schemaVersion` trong document ngay từ đầu để dễ migrate khi cấu trúc object thay đổi sau này.
