export interface DepartmentRequest {
	title: string;
	description: string;
	establishmentId: string;
}

export interface SubDepartmentRequest {
	title: string;
	description: string;
	departmentId: string;
}

export interface ThirdLevelDepartmentRequest {
	title: string;
	description: string;
	sousDepartmentId: string;
}

export interface DepartmentResponse {
	id: string;
	title: string;
	description: string;
	establishmentId: string;
	establishmentName: string;
	createdAt: Date;
	updatedAt: Date;
	sousDepartments: SubDepartmentResponse[];
}

export interface SubDepartmentResponse {
	id: string;
	title: string;
	description: string;
	departmentId: string;
	departmentName: string;
	createdAt: Date;
	updatedAt: Date;
	thirdDepartments: ThirdLevelDepartmentResponse[];
}

export interface ThirdLevelDepartmentResponse {
	id: string;
	title: string;
	description: string;
	subDepartmentId: string;
	subDepartmentName: string;
	createdAt: Date;
	updatedAt: Date;
}