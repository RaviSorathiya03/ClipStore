"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import axios from "axios"
import { Upload, CheckCircle, AlertCircle, Film, X, ImageIcon, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function VideoUpload() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [currentStep, setCurrentStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setCurrentStep(2)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile)
      setCurrentStep(2)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnail(reader.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !title) {
      setUploadStatus("error")
      return
    }

    try {
      setUploading(true)
      setProgress(0)
      setUploadStatus("idle")

      const { data } = await axios.post("/api/video", { title })
      const uploadUrl = data.url
      console.log(data.id)

      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setProgress(percentCompleted)
        },
      })

      setUploadStatus("success")
      setCurrentStep(3)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left sidebar - Progress steps */}
            <div className="lg:w-64 p-6 bg-gray-50 border-r border-gray-100">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600",
                    )}
                  >
                    1
                  </div>
                  <span className={cn("text-sm font-medium", currentStep >= 1 ? "text-blue-500" : "text-gray-600")}>
                    Select Video
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600",
                    )}
                  >
                    2
                  </div>
                  <span className={cn("text-sm font-medium", currentStep >= 2 ? "text-blue-500" : "text-gray-600")}>
                    Details
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= 3 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600",
                    )}
                  >
                    3
                  </div>
                  <span className={cn("text-sm font-medium", currentStep >= 3 ? "text-blue-500" : "text-gray-600")}>
                    Publish
                  </span>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-6">
              {currentStep === 1 && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn("relative group transition-all duration-300 ease-in-out", isDragging && "scale-102")}
                >
                  <input
                    ref={fileInputRef}
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="dropzone-file"
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-xl cursor-pointer",
                      "bg-white hover:bg-gray-50 transition duration-300 ease-in-out",
                      isDragging && "border-blue-500 bg-blue-50",
                    )}
                  >
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Upload className="w-12 h-12 mb-4 text-blue-500" />
                      <h3 className="mb-2 text-xl font-semibold text-gray-700">Drag and drop your video here</h3>
                      <p className="mb-4 text-sm text-gray-500">or click to select a file</p>
                      <Button variant="outline" className="relative">
                        Select File
                      </Button>
                      <p className="mt-4 text-xs text-gray-400">MP4, WebM, or OGG (MAX. 800MB)</p>
                    </div>
                  </label>
                </div>
              )}

              {currentStep === 2 && file && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Film className="w-8 h-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-gray-700">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1"
                        placeholder="Add a title that describes your video"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1"
                        placeholder="Tell viewers about your video"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700">Thumbnail</Label>
                      <div className="mt-1">
                        <div className="flex items-center gap-4">
                          <div className="relative group cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleThumbnailChange}
                              id="thumbnail"
                            />
                            <label
                              htmlFor="thumbnail"
                              className="block w-48 h-28 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors duration-200"
                            >
                              {thumbnail ? (
                                <img
                                  src={thumbnail || "/placeholder.svg"}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                  <span className="mt-1 text-xs text-gray-500">Upload thumbnail</span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleUpload} disabled={uploading || !title} className="gap-2">
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Upload Complete!</h3>
                  <p className="text-gray-500 mb-6">Your video has been uploaded successfully and is now processing.</p>
                  <Button
                    onClick={() => {
                      setCurrentStep(1)
                      setFile(null)
                      setTitle("")
                      setDescription("")
                      setThumbnail(null)
                    }}
                  >
                    Upload Another Video
                  </Button>
                </div>
              )}

              {uploading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                  <Card className="w-full max-w-md mx-4">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Uploading...</h3>
                          <span className="text-sm text-gray-500">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-gray-500">
                          Please keep this window open until the upload is complete
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {uploadStatus === "error" && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Failed to upload video. Please try again.</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

