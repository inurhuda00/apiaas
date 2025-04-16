import type { SVGProps } from "react";
import dynamic from "next/dynamic";

// Custom SVG components follow
const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		width={16}
		height={17}
		fill="none"
		{...props}
	>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M7.652.5a7.963 7.963 0 0 0-3.35.896l3.35 5.803V.5Zm0 9.301-3.35 5.803a7.963 7.963 0 0 0 3.35.896V9.801ZM8.35 16.5V9.798l3.351 5.805a7.963 7.963 0 0 1-3.351.897Zm0-9.297V.5a7.963 7.963 0 0 1 3.351.897L8.35 7.203Zm-7.103 5.6L7.05 9.452 3.7 15.256a8.05 8.05 0 0 1-2.454-2.453Zm13.51-8.604-5.804 3.35 3.351-5.803a8.05 8.05 0 0 1 2.453 2.453Zm-13.51 0a8.05 8.05 0 0 1 2.453-2.455L7.051 7.55 1.245 4.198Zm-.35.602A7.963 7.963 0 0 0 0 8.153h6.703L.896 4.801Zm.001 7.4A7.964 7.964 0 0 1 0 8.848h6.7L.898 12.2Zm8.402-4.048H16a7.964 7.964 0 0 0-.896-3.351L9.3 8.153Zm5.805 4.046L9.3 8.85H16a7.962 7.962 0 0 1-.896 3.35Zm-6.15-2.747 3.349 5.802a8.05 8.05 0 0 0 2.452-2.452l-5.802-3.35Z"
			clipRule="evenodd"
		/>
	</svg>
);

const LogoSmall = (props: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		width={32}
		height={32}
		fill="none"
		{...props}
	>
		<path
			fill="currentColor"
			fillRule="evenodd"
			d="M15.304 0c-2.41.103-4.681.739-6.7 1.792l6.7 11.606V0Zm0 18.603-6.7 11.605a15.927 15.927 0 0 0 6.7 1.792V18.603ZM16.697 32V18.595L23.4 30.206A15.928 15.928 0 0 1 16.697 32Zm0-18.594V0c2.41.103 4.684.74 6.704 1.794l-6.704 11.612Zm-14.205 11.2L14.1 17.904 7.398 29.51a16.1 16.1 0 0 1-4.906-4.905Zm27.02-17.208-11.607 6.701 6.701-11.607a16.101 16.101 0 0 1 4.905 4.906ZM2.49 7.396A16.1 16.1 0 0 1 7.398 2.49l6.704 11.61L2.49 7.396Zm-.697 1.206A15.927 15.927 0 0 0 0 15.306h13.406L1.793 8.602ZM1.794 23.4A15.927 15.927 0 0 1 0 16.699h13.401L1.794 23.4Zm16.805-8.095H32a15.927 15.927 0 0 0-1.792-6.702l-11.61 6.702ZM30.207 23.4l-11.604-6.7H32c-.104 2.41-.74 4.68-1.793 6.7Zm-12.3-5.494 6.699 11.604a16.1 16.1 0 0 0 4.904-4.905l-11.604-6.7Z"
			clipRule="evenodd"
		/>
	</svg>
);

const Google = (props: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			fill="currentColor"
			d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
		/>
	</svg>
);

const Overview = (props: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		width={24}
		height={24}
		fill="none"
		{...props}
	>
		<mask
			id="a"
			width={24}
			height={24}
			x={0}
			y={0}
			maskUnits="userSpaceOnUse"
		>
			<path fill="currentColor" d="M0 0h24v24H0z" />
		</mask>
		<path
			fill="currentColor"
			d="M3 21v-2l2-2v4H3Zm4 0v-6l2-2v8H7Zm4 0v-8l2 2.025V21h-2Zm4 0v-5.975l2-2V21h-2Zm4 0V11l2-2v12h-2ZM3 15.825V13l7-7 4 4 7-7v2.825l-7 7-4-4-7 7Z"
		/>
	</svg>
);

const DotRaster = (props: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		width={8}
		height={8}
		fill="none"
		{...props}
	>
		<mask
			id="a"
			width={8}
			height={8}
			x={0}
			y={0}
			maskUnits="userSpaceOnUse"
			style={{
				maskType: "alpha",
			}}
		>
			<circle cx={4} cy={4} r={4} fill="#D9D9D9" />
		</mask>
		<g fill="currentColor" mask="url(#a)">
			<path d="m4.58-1.398.717.698-6.28 6.447-.717-.698zM7.27-.072l.716.698L.45 8.363l-.716-.698zM9.962 1.255l.717.698-8.045 8.258-.717-.698z" />
		</g>
	</svg>
);

const TimeCog = (props: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		width={25}
		height={25}
		fill="none"
		{...props}
	>
		<path
			fill="currentColor"
			d="M22.947 19.415c.1 0 .1.1 0 .2l-1 1.7c-.1.1-.2.1-.3.1l-1.2-.4c-.3.2-.5.3-.8.5l-.2 1.3c0 .1-.1.2-.2.2h-2c-.1 0-.2-.1-.3-.2l-.2-1.3c-.3-.1-.6-.3-.8-.5l-1.2.5c-.1 0-.2 0-.3-.1l-1-1.7c-.1-.1 0-.2.1-.3l1.1-.8v-1l-1.1-.8c-.1-.1-.1-.2-.1-.3l1-1.7c.1-.1.2-.1.3-.1l1.2.5c.3-.2.5-.3.8-.5l.2-1.3c0-.1.1-.2.3-.2h2c.1 0 .2.1.2.2l.2 1.3c.3.1.6.3.9.5l1.2-.5c.1 0 .3 0 .3.1l1 1.7c.1.1 0 .2-.1.3l-1.1.8v1l1.1.8Zm-3.3-1.4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5.7 1.5 1.5 1.5 1.5-.7 1.5-1.5Zm-6.5-4v-6h-2v6m4-13h-6v2h6v-2Zm-3.7 19c-3.5-.4-6.3-3.4-6.3-7 0-3.9 3.1-7 7-7 3.2 0 5.9 2.1 6.7 5 .8.1 1.5.3 2.2.6-.3-1.6-.9-3-1.9-4.2l1.5-1.4c-.5-.5-1-1-1.5-1.4l-1.4 1.4c-1.5-1.3-3.5-2-5.6-2-5 0-9 4-9 9s4 9 9 9h.3c-.5-.6-.8-1.3-1-2Z"
		/>
	</svg>
);

const MoreHorizontal = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<circle cx="12" cy="12" r="1" />
		<circle cx="19" cy="12" r="1" />
		<circle cx="5" cy="12" r="1" />
	</svg>
);

const Spinner = (props: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path d="M21 12a9 9 0 1 1-6.219-8.56" />
	</svg>
);

const LinkOff = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
	<svg
		role="graphics-symbol"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path d="m9 17-2 2a2 2 0 0 1-2.85-2.82l2-2" />
		<path d="m13 7 2-2a2 2 0 0 1 2.82 2.82l-2 2" />
		<path d="M4.9 15.1 15.1 4.9" />
	</svg>
);

const DynamicIcons = {
	People: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdPeople }))),
	Settings: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdSettings }))),
	AddLink: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdAddLink }))),
	ArrowBack: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdArrowBack }))),
	ArrowRightAlt: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdArrowRightAlt }))),
	ArrowUpward: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdArrowUpward }))),
	AutoAwesome: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdAutoAwesome }))),
	ArrowForward: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineArrowForward }))),
	ArrowOutward: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineArrowOutward }))),
	AIOutline: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineAutoAwesome }))),
	CalendarMonth: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineCalendarMonth }))),
	ChatBubble: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineChatBubbleOutline }))),
	Condense: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineCloseFullscreen }))),
	Delete: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineDelete }))),
	Done: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineDone }))),
	ExitToApp: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineExitToApp }))),
	Face: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineFace }))),
	Inventory: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineInventory2 }))),
	ExternalLink: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineLaunch }))),
	Time: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineMoreTime }))),
	Notifications: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineNotificationsNone }))),
	Security: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineSecurity }))),
	Spellcheck: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineSpellcheck }))),
	WrapText: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineWrapText }))),
	TrendingDown: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdTrendingDown }))),
	TrendingUp: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdTrendingUp }))),
	Bold: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdFormatBold }))),
	Italic: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdFormatItalic }))),
	Strikethrough: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdFormatStrikethrough }))),
	Description: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdDescription }))),
	Image: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdImage }))),
	KeyboardArrowDown: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdKeyboardArrowDown }))),
	KeyboardArrowUp: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdKeyboardArrowUp }))),
	
	Check: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdCheck }))),
	X: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdClose }))),
	Close: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdClose }))),
	ChevronDown: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdExpandMore }))),
	ChevronUp: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdExpandLess }))),
	ChevronRight: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdChevronRight }))),
	ChevronLeft: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdChevronLeft }))),
	Search: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdSearch }))),
	Person: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdPerson }))),
	FileUpload: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineFileUpload }))),
	FileDownload: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineFileDownload }))),
	Download: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineFileDownload }))),
	Add: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdAdd }))),
	Plus: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdAdd }))),
	Minus: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdRemove }))),
	MoreHoriz: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdMoreHoriz }))),
	Info: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineInfo }))),
	AlertCircle: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineWarning }))),
	Error: dynamic(() => import("react-icons/md").then(mod => ({ default: mod.MdOutlineError }))),
};

export const Icons = {
	// SVG Custom
	LogoIcon,
	LogoSmall,
	Google,
	Overview,
	DotRaster,
	TimeCog,
	MoreHorizontal,
	Spinner,
	LinkOff,
	
	...DynamicIcons,
};
