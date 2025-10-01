import React, { useState, useEffect, useRef } from "react";
import "../styles/SellerApplication.css";
import CheersCelebrations from "../assets/CheersCelebrations.jpg";

const sellerStories = [
	{
		name: "Sip & Co. Distillery",
		story: "We grew our customer base by 300% in 6 months. The Drunken Giraffe made it easy to manage orders and payments.",
	},
	{
		name: "Barrel Boutique",
		story: "The marketing support and compliance help were game changers. We now reach customers across the country.",
	},
	{
		name: "Mixology Accessories",
		story: "As a small business, the platform gave us instant credibility and access to thousands of buyers.",
	},
	// Add more stories as needed
];

function getRandomPosition(containerWidth, containerHeight, storyWidth = 320, storyHeight = 100) {
	// Avoid the title area at the top (reserve 116px), and 16px from all other sides
	const minY = 116;
	const maxY = containerHeight - storyHeight - 16;
	const minX = 16;
	const maxX = containerWidth - storyWidth - 16;
	const top = Math.floor(Math.random() * (maxY - minY) + minY);
	const left = Math.floor(Math.random() * (maxX - minX) + minX);
	return { top, left };
}

export default function SellerApplication() {
	const [form, setForm] = useState({
		businessName: "",
		ownerName: "",
		email: "",
		phone: "",
		businessType: "",
		registrationNumber: "",
		licenseFile: null,
		productTypes: "",
		website: "",
		confirmLicensed: false,
	});
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [previewUrl, setPreviewUrl] = useState(null);

	const handleChange = (e) => {
		const { name, value, type, checked, files } = e.target;
		if (type === "checkbox") {
			setForm({ ...form, [name]: checked });
		} else if (type === "file") {
			setForm({ ...form, [name]: files[0] });
		} else {
			setForm({ ...form, [name]: value });
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setForm({ ...form, licenseFile: file });
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			setForm({ ...form, licenseFile: file });
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitError("");
		setSubmitting(true);

		// Prepare form data for multipart/form-data
		const formData = new FormData();
		Object.entries(form).forEach(([key, value]) => {
			if (key === "licenseFile" && value) {
				formData.append("licenseFile", value);
			} else {
				formData.append(key, value);
			}
		});

		try {
			const res = await fetch("/api/seller/apply", {
				method: "POST",
				body: formData,
			});
			if (!res.ok) {
				const err = await res.json();
				setSubmitError(err.message || "Submission failed");
				setSubmitting(false);
				return;
			}
			setSubmitted(true);
		} catch (err) {
			setSubmitError("Submission failed. Please try again.");
		}
		setSubmitting(false);
	};

	// Floating stories logic
	const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
	const [fadeState, setFadeState] = useState("show"); // "show" | "hide"
	const [position, setPosition] = useState({ top: 120, left: 120 });
	const bgRef = useRef();

	useEffect(() => {
		let fadeOutTimeout, nextTimeout;
		const showDuration = 12000; // 12s
		const fadeDuration = 1200; // 1.2s

		function setRandomPos() {
			if (bgRef.current) {
				const rect = bgRef.current.getBoundingClientRect();
				const pos = getRandomPosition(rect.width, rect.height);
				setPosition(pos);
			}
		}

		setFadeState("show");
		setRandomPos();

		fadeOutTimeout = setTimeout(() => setFadeState("hide"), showDuration - fadeDuration);
		nextTimeout = setTimeout(() => {
			setCurrentStoryIdx((idx) => (idx + 1) % sellerStories.length);
			setFadeState("show");
		}, showDuration);

		return () => {
			clearTimeout(fadeOutTimeout);
			clearTimeout(nextTimeout);
		};
		// eslint-disable-next-line
	}, [currentStoryIdx]);

	// When fading in, pick a new random position
	useEffect(() => {
		if (fadeState === "show" && bgRef.current) {
			const rect = bgRef.current.getBoundingClientRect();
			setPosition(getRandomPosition(rect.width, rect.height));
		}
	}, [fadeState]);

	useEffect(() => {
		// Save previous overflow value
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	}, []);

	return (
		<div className="seller-app-root">
			{/* Application Form (Left) */}
			<div className="seller-app-form-container">
				<h2 className="seller-app-form-title">
					Seller Application
				</h2>
				{submitted ? (
					<div className="seller-app-success-message">
						<h3>Thank you for your application!</h3>
						<p>
							Our team will review your submission and contact you at <b>{form.email}</b>.<br />
							We look forward to partnering with you!
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="seller-app-form">
						<label>
							Business Name
							<input
								type="text"
								name="businessName"
								value={form.businessName}
								onChange={handleChange}
								required
							/>
						</label>
						<label>
							Business Owner Full Name
							<input
								type="text"
								name="ownerName"
								value={form.ownerName}
								onChange={handleChange}
								required
							/>
						</label>
						<label>
							Email
							<input
								type="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								required
							/>
						</label>
						<label>
							Phone
							<input
								type="tel"
								name="phone"
								value={form.phone}
								onChange={handleChange}
								required
							/>
						</label>
						<label>
							Business Type
							<select
								name="businessType"
								value={form.businessType}
								onChange={handleChange}
								required
							>
								<option value="">Select type</option>
								<option value="Brewery">Brewery</option>
								<option value="Retailer">Retailer</option>
								<option value="Accessories Brand">Accessories Brand</option>
								<option value="Distillery">Distillery</option>
								<option value="Other">Other</option>
							</select>
						</label>
						<label>
							Business Registration Number
							<input
								type="text"
								name="registrationNumber"
								value={form.registrationNumber}
								onChange={handleChange}
								required
							/>
						</label>
						<label>
							Upload Liquor License
							<div
								className={`seller-app-dropzone${dragActive ? " drag-active" : ""}`}
								onDrop={handleDrop}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
							>
								<input
									type="file"
									name="licenseFile"
									accept=".pdf,.jpg,.jpeg,.png"
									onChange={handleFileChange}
									className="seller-app-file-input"
									style={{ display: "none" }}
									id="licenseFileInput"
								/>
								<label htmlFor="licenseFileInput" className="seller-app-dropzone-label">
									{previewUrl ? (
										<img
											src={previewUrl}
											alt="Preview"
											className="seller-app-dropzone-preview"
										/>
									) : (
										<span>
											Drag & drop your file here or <span className="seller-app-dropzone-browse">browse</span>
										</span>
									)}
								</label>
							</div>
						</label>
						<label>
							Product Types You Intend to Sell
							<input
								type="text"
								name="productTypes"
								value={form.productTypes}
								onChange={handleChange}
								required
								placeholder="e.g. Gin, Whiskey, Glassware"
							/>
						</label>
						<label>
							Website or Social Media Links
							<input
								type="text"
								name="website"
								value={form.website}
								onChange={handleChange}
								placeholder="https://yourbusiness.com or @yourhandle"
							/>
						</label>
						<label className="seller-app-checkbox-label">
							<input
								type="checkbox"
								name="confirmLicensed"
								checked={form.confirmLicensed}
								onChange={handleChange}
								required
							/>
							I confirm I am licensed to sell alcohol in my country.
						</label>
						{submitError && (
							<div className="seller-app-error">{submitError}</div>
						)}
						<button
							type="submit"
							disabled={submitting}
						>
							{submitting ? "Submitting..." : "Submit Application"}
						</button>
					</form>
				)}
			</div>
			{/* Seller Success Stories (Right) */}
			<div
				className="seller-app-stories-bg"
				ref={bgRef}
				style={{
					backgroundImage: `url(${CheersCelebrations})`,
				}}
			>
				<div className="seller-app-stories-title">Seller Success Stories</div>
				<div
					className={`seller-app-floating-story ${fadeState}`}
					style={{
						top: position.top,
						left: position.left,
					}}
				>
					<div className="seller-app-story-title">
						{sellerStories[currentStoryIdx].name}
					</div>
					<div>{sellerStories[currentStoryIdx].story}</div>
				</div>
			</div>
		</div>
	);
}
