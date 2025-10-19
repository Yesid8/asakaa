# Especificación Técnica: Vista de Detalle de Tarea

**Versión:** 1.0
**Fecha:** 13 de Octubre, 2025
**Componente:** CardDetailModal v2.0
**Objetivo:** Crear la experiencia de edición y consulta de tareas más rápida, intuitiva y eficiente del mercado

---

## 🎯 Filosofía de Diseño

### Principios Rectores

1. **Velocidad por Encima de Todo**
   - Apertura instantánea del modal (<100ms)
   - Edición inline sin recargas
   - Keyboard-first con atajos para cada acción
   - Guardar cambios sin confirmación (optimistic updates)

2. **Flujo Vertical Único**
   - Sin paneles laterales que fragmenten la atención
   - Toda la información en un scroll vertical natural
   - Jerarquía visual clara mediante espaciado y tipografía

3. **Claridad Visual**
   - Densidad de información alta pero organizada
   - Uso estratégico del color solo para comunicar estado
   - Microinteracciones sutiles que confirmen acciones

4. **Interacción Zero-Friction**
   - Edición inline en todos los campos
   - Paleta de comandos (Cmd+K) para acceso rápido
   - Autoguardado instantáneo (debounced 500ms)

---

## 📐 Anatomía del Modal

### 1. Contenedor Principal (Modal)

#### Layout & Dimensiones
```tsx
interface ModalContainerProps {
  maxWidth: '800px'
  height: 'auto' // Se ajusta al contenido
  padding: '24px'
  borderRadius: '16px'
  position: 'fixed'
  top: '50%'
  left: '50%'
  transform: 'translate(-50%, -50%)'
  zIndex: 1000
}
```

#### Animación de Apertura
```css
@keyframes modalOpen {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.modal-enter {
  animation: modalOpen 100ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

#### Backdrop
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(8px);
  background: var(--backdrop-overlay);
  z-index: 999;
}
```

#### Tokens de Color por Tema
```css
/* Dark Theme */
[data-theme="dark"] {
  --modal-bg: #222326;
  --modal-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  --backdrop-overlay: rgba(0, 0, 0, 0.5);
}

/* Light Theme */
[data-theme="light"] {
  --modal-bg: #FFFFFF;
  --modal-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  --backdrop-overlay: rgba(0, 0, 0, 0.3);
}

/* Neutral Theme */
[data-theme="neutral"] {
  --modal-bg: #F5F5F5;
  --modal-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  --backdrop-overlay: rgba(0, 0, 0, 0.25);
}
```

---

### 2. Header: Título y Prompt AI

#### Estructura HTML
```tsx
<header className="modal-header">
  {/* Título editable */}
  <h1
    className="task-title"
    contentEditable
    suppressContentEditableWarning
    onBlur={handleTitleSave}
    onKeyDown={handleTitleKeyDown}
  >
    {card.title}
  </h1>

  {/* Prompt AI */}
  <p className="ai-prompt">
    <span className="ai-icon">✨</span>
    Ask AI to write a description, create subtasks, or find similar tasks
  </p>

  {/* Botón cerrar */}
  <button
    className="close-button"
    onClick={onClose}
    aria-label="Close"
  >
    <IconX size={20} />
  </button>
</header>
```

#### Estilos del Título
```css
.task-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
  outline: none;
  transition: color 150ms ease;
}

.task-title:hover {
  color: var(--color-accent-primary);
}

.task-title:focus {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

#### Estilos del Prompt AI
```css
.ai-prompt {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 150ms ease;
}

.ai-prompt:hover {
  color: var(--color-text-primary);
}

.ai-icon {
  font-size: 16px;
  line-height: 1;
}
```

#### Comportamiento del Título
```tsx
const handleTitleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    e.currentTarget.blur() // Guarda y sale
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    e.currentTarget.textContent = card.title // Cancela
    e.currentTarget.blur()
  }
}

const handleTitleSave = (e: React.FocusEvent<HTMLHeadingElement>) => {
  const newTitle = e.currentTarget.textContent?.trim()
  if (newTitle && newTitle !== card.title) {
    updateCard({ ...card, title: newTitle })
  }
}
```

---

### 3. Panel de Metadatos ("La Cabina de Mando")

#### Estructura de Grid
```tsx
<section className="metadata-grid">
  <MetadataField
    icon={<IconStatus />}
    label="Status"
    value={card.status}
    shortcut="S"
    onClick={() => openStatusMenu()}
  />

  <MetadataField
    icon={<IconUser />}
    label="Assignees"
    value={card.assignedUserIds}
    shortcut="A"
    onClick={() => openAssigneeMenu()}
  />

  <MetadataField
    icon={<IconFlag />}
    label="Priority"
    value={card.priority}
    shortcut="P"
    onClick={() => openPriorityMenu()}
  />

  <MetadataField
    icon={<IconTag />}
    label="Labels"
    value={card.labels}
    shortcut="L"
    onClick={() => openLabelsMenu()}
  />

  <MetadataField
    icon={<IconCalendar />}
    label="Due Date"
    value={card.endDate}
    shortcut="D"
    onClick={() => openDatePicker()}
  />

  <MetadataField
    icon={<IconClock />}
    label="Estimated Time"
    value={card.estimatedTime}
    shortcut="E"
    onClick={() => openTimeInput()}
  />
</section>
```

#### Layout CSS
```css
.metadata-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
  padding: 24px 0;
  border-top: 1px solid var(--color-border-primary);
  border-bottom: 1px solid var(--color-border-primary);
}
```

#### Componente MetadataField
```tsx
interface MetadataFieldProps {
  icon: React.ReactNode
  label: string
  value: any
  shortcut: string
  onClick: () => void
}

const MetadataField: React.FC<MetadataFieldProps> = ({
  icon,
  label,
  value,
  shortcut,
  onClick
}) => {
  return (
    <button className="metadata-field" onClick={onClick}>
      <div className="metadata-label">
        <span className="metadata-icon">{icon}</span>
        <span className="metadata-text">{label}</span>
        <kbd className="metadata-shortcut">{shortcut}</kbd>
      </div>
      <div className="metadata-value">
        {renderValue(value)}
      </div>
    </button>
  )
}
```

#### Estilos MetadataField
```css
.metadata-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
}

.metadata-field:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-accent-primary);
}

.metadata-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.metadata-icon {
  display: flex;
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
}

.metadata-shortcut {
  margin-left: auto;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  background: var(--color-bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--color-border-primary);
}

.metadata-value {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-primary);
}

.metadata-value.empty {
  color: var(--color-text-tertiary);
  font-style: italic;
}
```

#### Sistema de Atajos de Teclado
```tsx
// Hook useKeyboardShortcuts dentro del modal
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ignorar si está escribiendo en un input
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (e.key.toLowerCase()) {
      case 's':
        e.preventDefault()
        openStatusMenu()
        break
      case 'a':
        e.preventDefault()
        openAssigneeMenu()
        break
      case 'p':
        e.preventDefault()
        openPriorityMenu()
        break
      case 'l':
        e.preventDefault()
        openLabelsMenu()
        break
      case 'd':
        e.preventDefault()
        openDatePicker()
        break
      case 'e':
        e.preventDefault()
        openTimeInput()
        break
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

---

### 4. Cuerpo Principal: Descripción

#### Estructura
```tsx
<section className="description-section">
  <div className="section-header">
    <IconDocument size={20} />
    <h2>Description</h2>
    <button className="ai-assist-button" onClick={openAIAssist}>
      <IconSparkles size={16} />
      AI Assist
    </button>
  </div>

  {isEditingDescription ? (
    <MarkdownEditor
      value={card.description || ''}
      onChange={handleDescriptionChange}
      onBlur={handleDescriptionSave}
      placeholder="Add description..."
      autoFocus
    />
  ) : (
    <div
      className="description-content"
      onClick={() => setIsEditingDescription(true)}
    >
      {card.description ? (
        <MarkdownRenderer content={card.description} />
      ) : (
        <p className="description-placeholder">
          <IconPencil size={16} />
          Add description...
        </p>
      )}
    </div>
  )}
</section>
```

#### Estilos Descripción
```css
.description-section {
  margin: 24px 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.ai-assist-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
}

.ai-assist-button:hover {
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  background: var(--color-bg-tertiary);
}

.description-content {
  min-height: 100px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: text;
  transition: all 150ms ease;
}

.description-content:hover {
  border-color: var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.description-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-tertiary);
  font-style: italic;
}
```

#### Markdown Editor
```tsx
interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  placeholder: string
  autoFocus?: boolean
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  autoFocus
}) => {
  const [showToolbar, setShowToolbar] = useState(false)

  return (
    <div className="markdown-editor">
      {showToolbar && <MarkdownToolbar />}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={() => setShowToolbar(true)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="markdown-textarea"
      />

      <div className="editor-footer">
        <span className="markdown-hint">
          <IconInfo size={14} />
          Markdown supported
        </span>
        <button className="editor-action" onClick={onBlur}>
          Done (Enter)
        </button>
      </div>
    </div>
  )
}
```

#### Estilos Markdown Editor
```css
.markdown-editor {
  border: 1px solid var(--color-accent-primary);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg-secondary);
}

.markdown-textarea {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  resize: vertical;
  font-family: inherit;
}

.markdown-textarea:focus {
  outline: none;
}

.markdown-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-bg-tertiary);
  border-top: 1px solid var(--color-border-primary);
}

.markdown-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.editor-action {
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-accent-primary);
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 150ms ease;
}

.editor-action:hover {
  background: var(--color-bg-secondary);
}
```

---

### 5. Secciones Adicionales: Subtasks, Custom Fields

#### Estructura Subtasks
```tsx
<section className="subtasks-section">
  <div className="section-header">
    <IconCheckSquare size={20} />
    <h2>Subtasks</h2>
    <span className="subtasks-count">{completedCount}/{totalCount}</span>
    <button className="add-subtask-button" onClick={addSubtask}>
      <IconPlus size={16} />
      Add
    </button>
  </div>

  <div className="subtasks-list">
    {subtasks.map(subtask => (
      <SubtaskRow
        key={subtask.id}
        subtask={subtask}
        onToggle={handleToggleSubtask}
        onEdit={handleEditSubtask}
        onDelete={handleDeleteSubtask}
      />
    ))}

    {isAddingSubtask && (
      <div className="subtask-input-row">
        <input
          type="text"
          placeholder="Subtask title..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={handleSubtaskKeyDown}
          onBlur={handleCreateSubtask}
          autoFocus
        />
      </div>
    )}
  </div>
</section>
```

#### Componente SubtaskRow
```tsx
interface SubtaskRowProps {
  subtask: Subtask
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
}

const SubtaskRow: React.FC<SubtaskRowProps> = ({
  subtask,
  onToggle,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(subtask.title)

  return (
    <div className={`subtask-row ${subtask.completed ? 'completed' : ''}`}>
      <button
        className="subtask-checkbox"
        onClick={() => onToggle(subtask.id)}
      >
        {subtask.completed ? (
          <IconCheckCircleFilled size={18} />
        ) : (
          <IconCircle size={18} />
        )}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            onEdit(subtask.id, title)
            setIsEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') {
              setTitle(subtask.title)
              setIsEditing(false)
            }
          }}
          className="subtask-input"
          autoFocus
        />
      ) : (
        <span
          className="subtask-title"
          onClick={() => setIsEditing(true)}
        >
          {subtask.title}
        </span>
      )}

      <div className="subtask-actions">
        {subtask.assignee && (
          <Avatar user={subtask.assignee} size="sm" />
        )}
        <button
          className="subtask-delete"
          onClick={() => onDelete(subtask.id)}
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  )
}
```

#### Estilos Subtasks
```css
.subtasks-section {
  margin: 32px 0;
  padding: 24px 0;
  border-top: 1px solid var(--color-border-primary);
}

.subtasks-count {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  padding: 2px 8px;
  background: var(--color-bg-tertiary);
  border-radius: 12px;
}

.add-subtask-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
  margin-left: auto;
}

.add-subtask-button:hover {
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
}

.subtasks-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subtask-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  transition: background 150ms ease;
}

.subtask-row:hover {
  background: var(--color-bg-secondary);
}

.subtask-row.completed .subtask-title {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}

.subtask-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 150ms ease;
}

.subtask-checkbox:hover {
  color: var(--color-accent-primary);
}

.subtask-title {
  flex: 1;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-primary);
  cursor: text;
}

.subtask-input {
  flex: 1;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
}

.subtask-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 150ms ease;
}

.subtask-row:hover .subtask-actions {
  opacity: 1;
}

.subtask-delete {
  display: flex;
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: color 150ms ease;
}

.subtask-delete:hover {
  color: var(--color-error);
}
```

---

### 6. Flujo de Actividad y Comentarios

#### Estructura
```tsx
<section className="activity-section">
  <div className="section-header">
    <IconMessageCircle size={20} />
    <h2>Activity</h2>
    <div className="activity-filters">
      <button
        className={`filter-button ${filter === 'all' ? 'active' : ''}`}
        onClick={() => setFilter('all')}
      >
        All
      </button>
      <button
        className={`filter-button ${filter === 'comments' ? 'active' : ''}`}
        onClick={() => setFilter('comments')}
      >
        Comments
      </button>
      <button
        className={`filter-button ${filter === 'history' ? 'active' : ''}`}
        onClick={() => setFilter('history')}
      >
        History
      </button>
    </div>
  </div>

  {/* Comment input */}
  <div className="comment-input-container">
    <Avatar user={currentUser} size="md" />
    <div className="comment-input-wrapper">
      <textarea
        className="comment-textarea"
        placeholder="Write a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyDown={handleCommentKeyDown}
        rows={1}
      />
      <div className="comment-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-button" title="Attach file">
            <IconPaperclip size={16} />
          </button>
          <button className="toolbar-button" title="Mention user">
            <IconAt size={16} />
          </button>
          <button className="toolbar-button" title="Add emoji">
            <IconMoodSmile size={16} />
          </button>
        </div>
        <button
          className="send-button"
          onClick={handleSendComment}
          disabled={!commentText.trim()}
        >
          Send
        </button>
      </div>
    </div>
  </div>

  {/* Activity timeline */}
  <div className="activity-timeline">
    {filteredActivity.map(item => (
      <ActivityItem key={item.id} item={item} />
    ))}
  </div>
</section>
```

#### Componente ActivityItem
```tsx
interface ActivityItemProps {
  item: ActivityItem
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item }) => {
  if (item.type === 'comment') {
    return (
      <div className="activity-item comment-item">
        <Avatar user={item.user} size="md" />
        <div className="activity-content">
          <div className="activity-header">
            <span className="activity-user">{item.user.name}</span>
            <span className="activity-timestamp">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <div className="comment-body">
            <MarkdownRenderer content={item.content} />
          </div>
          <div className="comment-actions">
            <button className="comment-action">
              <IconThumbUp size={14} />
              Like
            </button>
            <button className="comment-action">
              <IconMessage size={14} />
              Reply
            </button>
          </div>
        </div>
      </div>
    )
  }

  // History item (cambios de estado, movimientos, etc.)
  return (
    <div className="activity-item history-item">
      <div className="history-icon">
        {getHistoryIcon(item.action)}
      </div>
      <div className="activity-content">
        <div className="history-text">
          <span className="activity-user">{item.user.name}</span>
          {' '}
          {getHistoryText(item)}
        </div>
        <span className="activity-timestamp">
          {formatRelativeTime(item.createdAt)}
        </span>
      </div>
    </div>
  )
}
```

#### Estilos Activity
```css
.activity-section {
  margin: 32px 0 0 0;
  padding: 24px 0 0 0;
  border-top: 1px solid var(--color-border-primary);
}

.activity-filters {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.filter-button {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
}

.filter-button:hover {
  background: var(--color-bg-tertiary);
}

.filter-button.active {
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  background: var(--color-accent-primary-alpha);
}

.comment-input-container {
  display: flex;
  gap: 12px;
  margin: 16px 0;
  padding: 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-textarea {
  width: 100%;
  min-height: 36px;
  max-height: 200px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-text-primary);
  background: transparent;
  border: 1px solid var(--color-border-secondary);
  border-radius: 6px;
  resize: none;
  transition: border-color 150ms ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.comment-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.comment-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 4px;
}

.toolbar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 150ms ease;
}

.toolbar-button:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.send-button {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-bg-primary);
  background: var(--color-accent-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
}

.send-button:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.activity-timeline {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.activity-user {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.activity-timestamp {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-tertiary);
}

.comment-body {
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--color-border-primary);
}

.comment-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 150ms ease;
}

.comment-action:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
}

.history-item {
  padding: 12px;
  border-radius: 8px;
  transition: background 150ms ease;
}

.history-item:hover {
  background: var(--color-bg-secondary);
}

.history-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.history-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.history-text .activity-user {
  color: var(--color-text-primary);
  font-weight: 600;
}
```

---

## ⌨️ Sistema de Atajos de Teclado Completo

```tsx
const MODAL_SHORTCUTS = {
  // Navegación
  'Escape': 'Cerrar modal',
  'Cmd+K': 'Abrir paleta de comandos',

  // Edición de campos
  'S': 'Cambiar status',
  'A': 'Asignar usuarios',
  'P': 'Cambiar prioridad',
  'L': 'Editar labels',
  'D': 'Cambiar fecha',
  'E': 'Editar estimación',

  // Descripción
  'I': 'Editar descripción',
  'Cmd+Enter': 'Guardar descripción',

  // Subtasks
  'T': 'Añadir subtask',
  'Cmd+Shift+T': 'Toggle todas las subtasks',

  // Comentarios
  'C': 'Focus en comentario',
  'Cmd+Enter': 'Enviar comentario',

  // Acciones
  'Cmd+D': 'Duplicar tarea',
  'Cmd+Shift+D': 'Eliminar tarea',
  'Cmd+Shift+C': 'Copiar link',

  // AI
  'Cmd+J': 'Abrir AI assist'
}

const useModalKeyboardShortcuts = (
  card: Card,
  handlers: ModalHandlers
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo
      if (isTyping(e.target)) return

      const isMod = e.metaKey || e.ctrlKey
      const isShift = e.shiftKey

      // Cmd+K - Command palette
      if (isMod && e.key === 'k') {
        e.preventDefault()
        handlers.openCommandPalette()
        return
      }

      // Escape - Close
      if (e.key === 'Escape') {
        e.preventDefault()
        handlers.onClose()
        return
      }

      // Single key shortcuts
      if (!isMod && !isShift) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault()
            handlers.openStatusMenu()
            break
          case 'a':
            e.preventDefault()
            handlers.openAssigneeMenu()
            break
          case 'p':
            e.preventDefault()
            handlers.openPriorityMenu()
            break
          case 'l':
            e.preventDefault()
            handlers.openLabelsMenu()
            break
          case 'd':
            e.preventDefault()
            handlers.openDatePicker()
            break
          case 'e':
            e.preventDefault()
            handlers.openTimeInput()
            break
          case 'i':
            e.preventDefault()
            handlers.focusDescription()
            break
          case 't':
            e.preventDefault()
            handlers.addSubtask()
            break
          case 'c':
            e.preventDefault()
            handlers.focusComment()
            break
        }
      }

      // Cmd shortcuts
      if (isMod && !isShift) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault()
            handlers.duplicateCard()
            break
          case 'j':
            e.preventDefault()
            handlers.openAIAssist()
            break
        }
      }

      // Cmd+Shift shortcuts
      if (isMod && isShift) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault()
            handlers.deleteCard()
            break
          case 'c':
            e.preventDefault()
            handlers.copyLink()
            break
          case 't':
            e.preventDefault()
            handlers.toggleAllSubtasks()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [card, handlers])
}
```

---

## 🎨 Tokens de Color Específicos del Modal

```css
/* Tokens adicionales para el modal */
:root {
  --modal-backdrop-blur: 8px;
  --modal-transition-duration: 100ms;
  --modal-border-radius: 16px;
  --modal-padding: 24px;
  --modal-max-width: 800px;
}

[data-theme="dark"] {
  --color-accent-primary-alpha: rgba(94, 106, 210, 0.1);
  --comment-bg: #2A2B2F;
}

[data-theme="light"] {
  --color-accent-primary-alpha: rgba(94, 106, 210, 0.08);
  --comment-bg: #F7F7F8;
}

[data-theme="neutral"] {
  --color-accent-primary-alpha: rgba(0, 0, 0, 0.05);
  --comment-bg: #EBEBEB;
}
```

---

## 🚀 Optimizaciones de Performance

### 1. Lazy Loading de Componentes Pesados
```tsx
const MarkdownEditor = lazy(() => import('./MarkdownEditor'))
const AIAssistModal = lazy(() => import('./AIAssistModal'))
```

### 2. Virtualización de Activity Timeline
```tsx
// Para cards con 100+ comentarios/actividades
import { VirtualList } from 'react-virtual'

<VirtualList
  height={600}
  itemCount={activity.length}
  itemSize={80}
  renderItem={(index) => <ActivityItem item={activity[index]} />}
/>
```

### 3. Debouncing de Autosave
```tsx
const debouncedSave = useMemo(
  () => debounce((card: Card) => {
    updateCard(card)
  }, 500),
  []
)
```

### 4. Optimistic Updates
```tsx
const handleToggleSubtask = (subtaskId: string) => {
  // Update UI immediately
  setSubtasks(prev =>
    prev.map(st =>
      st.id === subtaskId
        ? { ...st, completed: !st.completed }
        : st
    )
  )

  // Save to backend
  updateSubtask(subtaskId).catch(() => {
    // Rollback on error
    setSubtasks(previousSubtasks)
  })
}
```

---

## 📱 Responsive Design

```css
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    width: 100%;
    height: 100vh;
    margin: 0;
    border-radius: 0;
    transform: translate(0, 0);
    top: 0;
    left: 0;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-wrap: wrap;
  }
}
```

---

## 🎯 Métricas de Éxito

### Performance Targets
- ✅ Apertura del modal: <100ms
- ✅ Time to Interactive: <200ms
- ✅ Autosave latency: 500ms debounce
- ✅ Smooth scroll: 60fps
- ✅ Keyboard shortcut response: <50ms

### UX Targets
- ✅ Zero clicks para empezar a editar cualquier campo
- ✅ 100% keyboard navigable
- ✅ Todas las acciones comunes en <2 segundos
- ✅ AI assist responde en <3 segundos

---

## 📦 Estructura de Archivos

```
packages/board/src/components/CardDetailModal/
├── CardDetailModal.tsx          # Componente principal
├── CardDetailModal.css          # Estilos
├── components/
│   ├── ModalHeader.tsx
│   ├── MetadataGrid.tsx
│   ├── MetadataField.tsx
│   ├── DescriptionSection.tsx
│   ├── MarkdownEditor.tsx
│   ├── MarkdownRenderer.tsx
│   ├── SubtasksSection.tsx
│   ├── SubtaskRow.tsx
│   ├── CustomFieldsSection.tsx
│   ├── ActivitySection.tsx
│   ├── ActivityItem.tsx
│   └── CommentInput.tsx
├── hooks/
│   ├── useModalKeyboardShortcuts.ts
│   ├── useAutoSave.ts
│   └── useActivityTimeline.ts
├── utils/
│   ├── formatters.ts
│   └── validators.ts
└── types.ts
```

---

## ⏱️ Estimación de Desarrollo

| Componente | Tiempo | Prioridad |
|-----------|--------|-----------|
| **Contenedor modal + backdrop** | 0.5 días | Alta |
| **Header + título editable** | 0.5 días | Alta |
| **Metadata grid + fields** | 2 días | Alta |
| **Descripción + Markdown editor** | 2 días | Alta |
| **Subtasks section** | 2 días | Alta |
| **Activity timeline** | 2 días | Media |
| **Comment input + UI** | 1.5 días | Media |
| **Keyboard shortcuts system** | 1 día | Alta |
| **AI integration points** | 1 día | Media |
| **Custom fields section** | 1.5 días | Media |
| **Responsive design** | 1 día | Media |
| **Testing + polish** | 2 días | Alta |
| **TOTAL** | **17 días** | |

**Desarrollador:** Senior React + CSS
**Costo estimado:** $11,560 (@ $70/hr)

---

## 🎨 Diseño Final: Ventajas Competitivas

### vs Competidores Actuales

| Aspecto | DHTMLX | Estándar Kanban | ASAKAA v2.0 |
|---------|--------|-----------------|-------------|
| **Velocidad apertura** | ~300ms | ~500ms | <100ms ✅ |
| **Keyboard-first** | ⚠️ Básico | ⚠️ Básico | ✅ Completo |
| **Flujo vertical** | ❌ | ❌ | ✅ |
| **AI integration** | ❌ | ❌ | ✅ |
| **Markdown support** | ⚠️ Limitado | ❌ | ✅ Completo |
| **Autosave** | ⚠️ Manual | ⚠️ Manual | ✅ Instantáneo |
| **Subtasks inline** | ❌ | ⚠️ Básico | ✅ Rico |
| **Activity timeline** | ⚠️ Básico | ⚠️ Básico | ✅ Completo |

---

Esta especificación crea una experiencia de clase mundial que combina:
- ⚡ **Velocidad** (apertura <100ms, interacciones instantáneas)
- ⌨️ **Keyboard-first** (100% navegable sin mouse)
- 🎨 **Diseño limpio** (flujo vertical único, sin distracciones)
- 🤖 **AI nativo** (integrado en cada sección)
- 📱 **Responsive** (funciona en mobile)

**Resultado:** La vista de detalle de tarea más rápida y eficiente del mercado, posicionando a ASAKAA como líder en UX para Kanban boards.
