"use client"

import type React from "react"
import { useState, useCallback } from "react"
import axios from "axios"
import { Upload, CheckCircle, AlertCircle, Film, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

export default function VideoUpload() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }, [])

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

      const response = await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setProgress(percentCompleted)
        },
      })
      console.log(response)

      setUploadStatus("success")
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-lg">
        <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">Upload Your Video</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Share your content with the world
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Video Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Provide a brief description of your video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative group">
            <input id="dropzone-file" type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <Film className="w-10 h-10 mb-3 text-blue-500" />
                ) : (
                  <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                )}
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">{file ? "Change video" : "Click to upload"}</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">MP4, WebM, or OGG (MAX. 800MB)</p>
              </div>
            </label>
          </div>
          {file && (
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-3 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-200 truncate flex-1">
                Selected: <span className="font-semibold">{file.name}</span>
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="text-blue-700 dark:text-blue-200 hover:text-red-500 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !title}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </Button>
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full h-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Uploading: {progress}%</p>
            </div>
          )}
          {uploadStatus === "success" && (
            <Alert variant="default" className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
              <AlertTitle className="text-green-700 dark:text-green-200">Success!</AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-300">
                Your video has been uploaded successfully and is now processing.
              </AlertDescription>
            </Alert>
          )}
          {uploadStatus === "error" && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
              <AlertTitle className="text-red-700 dark:text-red-200">Error</AlertTitle>
              <AlertDescription className="text-red-600 dark:text-red-300">
                Failed to upload video. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

