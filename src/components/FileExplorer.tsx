import React, { useState, useCallback } from 'react';
import { Upload, FolderUp, ChevronLeft, Folder, File, Download, Link, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  children?: FileSystemItem[];
  path: string;
  content?: File;
}

export function FileExplorer() {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<FileSystemItem | null>(null);
  const [itemToRename, setItemToRename] = useState<FileSystemItem | null>(null);
  const [newName, setNewName] = useState('');
  const dragCounter = React.useRef(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newItems = Array.from(event.target.files).map(file => {
        const path = file.webkitRelativePath || file.name;
        const parts = path.split('/');
        return createFileSystemItem(file, parts, '');
      });

      setFileSystem(prev => mergeFileSystem(prev, newItems));
    }
  };

  const createFileSystemItem = (file: File, pathParts: string[], parentPath: string): FileSystemItem => {
    const name = pathParts[0];
    const currentPath = parentPath ? `${parentPath}/${name}` : name;

    if (pathParts.length === 1) {
      return {
        id: crypto.randomUUID(),
        name,
        type: 'file',
        size: file.size,
        path: currentPath,
        content: file,
      };
    } else {
      const remainingPath = pathParts.slice(1);
      const childItem = createFileSystemItem(file, remainingPath, currentPath);
      
      return {
        id: crypto.randomUUID(),
        name,
        type: 'folder',
        children: [childItem],
        path: currentPath,
      };
    }
  };

  const mergeFileSystem = (existing: FileSystemItem[], newItems: FileSystemItem[]): FileSystemItem[] => {
    const merged = [...existing];

    newItems.forEach(newItem => {
      const existingIndex = merged.findIndex(item => item.path === newItem.path);

      if (existingIndex === -1) {
        merged.push(newItem);
      } else if (newItem.type === 'folder' && merged[existingIndex].type === 'folder') {
        merged[existingIndex] = {
          ...merged[existingIndex],
          children: mergeFileSystem(
            merged[existingIndex].children || [],
            newItem.children || []
          ),
        };
      }
    });

    return merged;
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.items) {
      const items = Array.from(e.dataTransfer.items);
      let processedItems = 0;

      items.forEach(item => {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            processEntry(entry, '', []).then(fileSystemItems => {
              setFileSystem(prev => mergeFileSystem(prev, fileSystemItems));
              processedItems++;
              if (processedItems === items.length) {
                toast.success(`${processedItems} item(s) adicionado(s)`);
              }
            });
          }
        }
      });
    }
  }, []);

  const processEntry = async (entry: any, parentPath: string, items: FileSystemItem[]): Promise<FileSystemItem[]> => {
    if (entry.isFile) {
      return new Promise(resolve => {
        entry.file((file: File) => {
          const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;
          items.push({
            id: crypto.randomUUID(),
            name: entry.name,
            type: 'file',
            size: file.size,
            path,
            content: file,
          });
          resolve(items);
        });
      });
    } else if (entry.isDirectory) {
      const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;
      const dirReader = entry.createReader();
      const folderItem: FileSystemItem = {
        id: crypto.randomUUID(),
        name: entry.name,
        type: 'folder',
        children: [],
        path,
      };
      items.push(folderItem);

      return new Promise(resolve => {
        const readEntries = () => {
          dirReader.readEntries(async (entries: any[]) => {
            if (entries.length === 0) {
              resolve(items);
            } else {
              for (const entry of entries) {
                await processEntry(entry, path, folderItem.children!);
              }
              readEntries();
            }
          });
        };
        readEntries();
      });
    }
    return items;
  };

  const removeItem = (path: string) => {
    setFileSystem(prev => {
      const removeFromItems = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.filter(item => {
          if (item.path === path) {
            return false;
          }
          if (item.children) {
            item.children = removeFromItems(item.children);
          }
          return true;
        });
      };
      return removeFromItems(prev);
    });
    toast.success('Item removido');
  };

  const getCurrentItems = (): FileSystemItem[] => {
    let current = fileSystem;
    for (const pathPart of currentPath) {
      const folder = current.find(item => item.path === pathPart);
      if (folder && folder.children) {
        current = folder.children;
      } else {
        return [];
      }
    }
    return current;
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(prev => [...prev, path]);
  };

  const navigateBack = () => {
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const getBreadcrumbs = () => {
    if (currentPath.length === 0) return 'Área de Trabalho';
    const parts = currentPath[currentPath.length - 1].split('/');
    return parts[parts.length - 1];
  };

  const handleDownload = (item: FileSystemItem) => {
    if (item.type === 'file' && item.content) {
      const url = URL.createObjectURL(item.content);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Baixando ${item.name}`);
    }
  };

  const handleCopyLink = (item: FileSystemItem) => {
    if (item.type === 'file' && item.content) {
      const url = URL.createObjectURL(item.content);
      navigator.clipboard.writeText(url);
      toast.success('Link copiado para a área de transferência');
    }
  };

  const handleRename = (item: FileSystemItem) => {
    setItemToRename(item);
    setNewName(item.name);
  };

  const confirmRename = () => {
    if (!itemToRename || !newName.trim()) return;

    setFileSystem(prev => {
      const renameInItems = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.id === itemToRename.id) {
            const pathParts = item.path.split('/');
            pathParts[pathParts.length - 1] = newName;
            return { ...item, name: newName, path: pathParts.join('/') };
          }
          if (item.children) {
            return { ...item, children: renameInItems(item.children) };
          }
          return item;
        });
      };
      return renameInItems(prev);
    });

    setItemToRename(null);
    setNewName('');
    toast.success('Item renomeado');
  };

  const handleDelete = (item: FileSystemItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    removeItem(itemToDelete.path);
    setItemToDelete(null);
  };

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {currentPath.length > 0 && (
            <button
              onClick={navigateBack}
              className="flex items-center space-x-2 text-green-500 hover:bg-green-500/10 p-2 rounded transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Voltar</span>
            </button>
          )}
          <h2 className="text-green-500 text-lg font-medium">{getBreadcrumbs()}</h2>
        </div>
        <label className="flex items-center space-x-2 text-green-500 hover:bg-green-500/10 p-2 rounded cursor-pointer transition-colors">
          <Upload className="h-5 w-5" />
          <span className="text-sm">Upload</span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            multiple
            webkitdirectory=""
            directory=""
          />
        </label>
      </div>

      <div
        className="relative min-h-[calc(100vh-12rem)]"
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-green-500 bg-green-500/10 rounded-lg flex items-center justify-center z-10">
            <div className="text-green-500 text-center">
              <Upload className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Solte os arquivos aqui</p>
            </div>
          </div>
        )}

        {getCurrentItems().length === 0 && !isDragging ? (
          <div className="h-full flex flex-col items-center justify-center text-green-500/50">
            <FolderUp className="h-16 w-16 mb-4" />
            <p className="text-sm">Arraste arquivos aqui ou clique em Upload</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {getCurrentItems().map(item => (
              <ContextMenu key={item.id}>
                <ContextMenuTrigger>
                  <div
                    className="group relative flex flex-col items-center p-4 rounded-lg hover:bg-green-500/10 transition-colors cursor-pointer"
                    onClick={() => item.type === 'folder' && navigateToFolder(item.path)}
                    onDoubleClick={() => item.type === 'file' && handleDownload(item)}
                  >
                    {item.type === 'folder' ? (
                      <Folder className="w-16 h-16 text-green-500 mb-2" />
                    ) : (
                      <File className="w-16 h-16 text-green-500 mb-2" />
                    )}
                    <span className="text-green-500 text-sm text-center truncate w-full">
                      {item.name}
                    </span>
                    {item.size && (
                      <span className="text-green-500/50 text-xs">
                        {formatFileSize(item.size)}
                      </span>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {item.type === 'file' && (
                    <>
                      <ContextMenuItem onClick={() => handleDownload(item)}>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCopyLink(item)}>
                        <Link className="w-4 h-4 mr-2" />
                        Copiar Link
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                    </>
                  )}
                  <ContextMenuItem onClick={() => handleRename(item)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Renomear
                  </ContextMenuItem>
                  <ContextMenuItem className="text-red-500" onClick={() => handleDelete(item)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setItemToDelete(null)}
              className="px-4 py-2 text-green-500 hover:bg-green-500/10 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors ml-2"
            >
              Deletar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!itemToRename} onOpenChange={() => setItemToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear item</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-500 placeholder-green-500/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Novo nome"
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setItemToRename(null)}
              className="px-4 py-2 text-green-500 hover:bg-green-500/10 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmRename}
              className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded transition-colors ml-2"
            >
              Renomear
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}