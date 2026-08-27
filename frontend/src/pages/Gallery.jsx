import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useUser } from "../UserContext";
import { FaFolderOpen, FaTrash, FaCamera, FaFolder, FaUpload } from "react-icons/fa";
import { IoArrowBack, IoAdd } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const Gallery = () => {
    const { user } = useUser();
    const userId = user?.id;

    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [images, setImages] = useState([]);
    const [uploadMode, setUploadMode] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState("");
    const [selectedImage, setSelectedImage] = useState(null); // State for modal
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState("Choose a file...");

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { 
                staggerChildren: 0.1
            } 
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    useEffect(() => {
        axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/gallery/folders`)
            .then(response => setFolders(response.data))
            .catch(error => {
                toast.error("Failed to fetch folders");
            });
    }, []);

    const openFolder = (folder) => {
        setCurrentFolder(folder.folderName);
        setCurrentFolderId(folder.id);
        axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/gallery/folder/${folder.folderName}`)
            .then(response => setImages(response.data))
            .catch(error => {
                toast.error(`Failed to open folder "${folder.folderName}"`);
            });
    };

    const handleUpload = async () => {
        const finalFolder = folderName || selectedFolder;
        if (!finalFolder || !selectedFile) {
            toast.warning("Folder name and image file are required.");
            return;
        }

        setIsUploading(true); // Start uploading

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);
            formData.append("folderName", finalFolder);
            formData.append("userId", userId);

            await axiosInstance.post(`${import.meta.env.VITE_API_URL}/api/gallery/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });

            toast.success("Image uploaded successfully!");
            setUploadMode(false);
            setFolderName("");
            setSelectedFile(null);
            setSelectedFolder("");
            setSelectedFileName("Choose a file...");
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false); // Reset uploading state
        }
    };

    const handleDeleteFolder = async (folderId) => {
        toast.info(
            <div>
                <p>Are you sure you want to delete this folder?</p>
                <div className="mt-2 flex justify-center space-x-3">
                    <button 
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => {
                            toast.dismiss();
                            deleteFolderConfirmed(folderId);
                        }}
                    >
                        Yes, Delete
                    </button>
                    <button 
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                        onClick={() => toast.dismiss()}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false
            }
        );
    };
    
    const deleteFolderConfirmed = async (folderId) => {
        try {
            await axiosInstance.delete(`${import.meta.env.VITE_API_URL}/api/gallery/folders/${folderId}`, { withCredentials: true });
            setFolders(folders.filter((folder) => folder.id !== folderId));
            toast.success("Folder deleted successfully");
        } catch (error) {
            toast.error("Failed to delete folder");
        }
    };

    const handleDeleteImage = async (folderId, imageUrl) => {
        toast.info(
            <div>
                <p>Are you sure you want to delete this image?</p>
                <div className="mt-2 flex justify-center space-x-3">
                    <button 
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => {
                            toast.dismiss();
                            deleteImageConfirmed(folderId, imageUrl);
                        }}
                    >
                        Yes, Delete
                    </button>
                    <button 
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                        onClick={() => toast.dismiss()}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false
            }
        );
    };

    const deleteImageConfirmed = async (folderId, imageUrl) => {
        try {
            await axiosInstance.delete(`${import.meta.env.VITE_API_URL}/api/gallery/${folderId}/images`, {
                data: { imageUrl },  // Send image URL in request body
                withCredentials: true
            });

            // Update UI: Remove only the deleted image from the state
            setImages(images.filter((img) => img !== imageUrl));
            toast.success("Image deleted successfully");
        } catch (error) {
            toast.error("Failed to delete image");
        }
    };

    const handleModalKeyPress = (e) => {
        if (e.key === 'Enter' && !isUploading && (folderName || selectedFolder) && selectedFile) {
            handleUpload();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setSelectedFileName(file.name);
        }
    };

    return (
        <div className="min-h-[calc(100vh-180px)] bg-[#FAF6F0] py-12 px-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-[#3D0707]">
                    Photo Gallery
                </h2>
                <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 text-sm">
                    Explore our collection of memories and moments captured through the years.
                </p>

                {/* Upload Button - Hidden when inside a folder */}
                {userId && !uploadMode && !currentFolder && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setUploadMode(true)}
                        className="fixed bottom-[40px] right-5 bg-gradient-to-r from-[#8B1E1E] to-[#6F1111] text-white px-5 py-3 rounded-full shadow-lg hover:from-[#6F1111] hover:to-[#531010] transition duration-300 font-semibold flex items-center space-x-2 z-10"
                    >
                        <IoAdd size={22} />
                        <span>Upload Image</span>
                    </motion.button>
                )}

                {/* Image Upload Modal */}
                <AnimatePresence>
                    {uploadMode && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="bg-white p-8 rounded-xl border border-[#E7DDD6] shadow-2xl w-96 relative"
                            >
                                <button
                                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition duration-200"
                                    onClick={() => setUploadMode(false)}
                                >
                                    ✖
                                </button>
                                <h3 className="text-2xl font-bold text-center mb-6 text-[#3D0707]">
                                    <FaUpload className="inline-block mr-2 text-[#8B1E1E]" />
                                    Upload Image
                                </h3>
                                
                                <div className="space-y-5 text-sm">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#3D0707] mb-1">Select a Folder:</label>
                                        <select
                                            value={selectedFolder}
                                            onChange={(e) => {
                                                setSelectedFolder(e.target.value);
                                                if (e.target.value) setFolderName(""); // Clear new folder name when dropdown is used
                                            }}
                                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition cursor-pointer text-gray-800"
                                        >
                                            <option value="">Choose an existing folder</option>
                                            {folders.map(folder => (
                                                <option key={folder.folderName} value={folder.folderName}>
                                                    {folder.folderName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-[#3D0707] mb-1">Or Create a New Folder:</label>
                                        <input
                                            type="text"
                                            placeholder="Enter folder name"
                                            value={folderName}
                                            onChange={(e) => setFolderName(e.target.value)}
                                            onKeyPress={handleModalKeyPress}
                                            className={`w-full p-3 border rounded-lg transition focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] text-gray-800 ${
                                                selectedFolder ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200" : "bg-gray-50 border-gray-300"
                                            }`}
                                            disabled={selectedFolder}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#3D0707] mb-1">Upload Image:</label>
                                        <div className="relative flex items-center border border-gray-300 bg-gray-50 rounded-lg p-3 overflow-hidden cursor-pointer">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                disabled={isUploading}
                                                accept="image/*"
                                            />
                                            <FaCamera className="text-gray-500 mr-2" />
                                            <span className="text-gray-600 truncate">{selectedFileName}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={handleUpload}
                                            className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-[#8B1E1E] to-[#6F1111] text-white px-4 py-3 rounded-lg shadow-md transition duration-300 w-full mr-2 font-bold
                                                ${isUploading ? "opacity-70 cursor-not-allowed" : "hover:from-[#6F1111] hover:to-[#531010] hover:shadow-lg"}`}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload />
                                                    <span>Upload</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setUploadMode(false)}
                                            className="bg-gray-400 text-white px-4 py-3 rounded-lg shadow-md hover:bg-gray-500 transition duration-300 w-1/3 font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Folder View */}
                <AnimatePresence mode="wait">
                    {!currentFolder ? (
                        <motion.div
                            key="folders"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <div className="flex items-center mb-6">
                                <FaFolderOpen className="text-yellow-500 text-2xl mr-3" />
                                <h3 className="text-xl font-bold text-gray-800">Photo Albums</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {folders.length > 0 ? (
                                    folders.map(folder => (
                                        <motion.div
                                            key={folder.folderName}
                                            variants={itemVariants}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            onClick={() => openFolder(folder)}
                                            className="relative flex flex-col items-center justify-center bg-white border border-[#E7DDD6] shadow-sm hover:shadow-md transition duration-300 p-8 rounded-xl cursor-pointer group overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#FAF6F0] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            
                                            {user && user.role === "ADMIN" && (
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation(); // Prevent opening folder on delete click
                                                        handleDeleteFolder(folder.id);
                                                    }}
                                                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition opacity-0 group-hover:opacity-100 z-10 shadow-md"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                            
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="bg-yellow-50 border border-yellow-100 p-5 rounded-full mb-4">
                                                    <FaFolder size={50} className="text-yellow-500" />
                                                </div>
                                                <p className="mt-2 text-center text-lg font-bold text-gray-850">{folder.folderName}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10">
                                        <FaFolder className="text-gray-300 text-5xl mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No albums found. Create one by uploading an image.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="images"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <div className="flex items-center mb-6">
                                <motion.button
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setCurrentFolder(null)}
                                    className="bg-gradient-to-r from-[#8B1E1E] to-[#6F1111] hover:from-[#6F1111] hover:to-[#531010] p-3 rounded-full text-white shadow-md mr-4 flex items-center justify-center transition-all"
                                    aria-label="Go back to folders"
                                >
                                    <IoArrowBack size={20} />
                                </motion.button>
                                
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <FaFolderOpen className="mr-2 text-yellow-500" /> 
                                    {currentFolder}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {images.length > 0 ? (
                                    images.map((img, index) => (
                                        <motion.div 
                                            key={index} 
                                            variants={itemVariants}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="relative group bg-white p-3 rounded-xl border border-[#E7DDD6] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                        >
                                            {user && user.role === "ADMIN" && (
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDeleteImage(currentFolderId, img);
                                                    }}
                                                    className="absolute top-5 right-5 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition opacity-0 group-hover:opacity-100 shadow-md"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                            
                                            <div className="overflow-hidden rounded-lg">
                                                <img
                                                    src={img}
                                                    alt={`Image ${index}`}
                                                    className="w-full h-52 object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                                                    onClick={() => setSelectedImage(img)}
                                                />
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10">
                                        <FaCamera className="text-gray-300 text-5xl mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No images in this album.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Image Modal */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-80 z-50"
                            onClick={() => setSelectedImage(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="relative max-w-[80%] max-h-[80%] overflow-hidden rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img 
                                    src={selectedImage} 
                                    className="max-w-full max-h-[80vh] object-contain" 
                                    alt="Enlarged view"
                                />
                                <button 
                                    className="absolute top-4 right-4 bg-white bg-opacity-80 text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all" 
                                    onClick={() => setSelectedImage(null)}
                                >
                                    ✖
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Gallery;
