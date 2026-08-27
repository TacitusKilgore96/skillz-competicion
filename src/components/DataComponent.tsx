import React from "react";

export interface AsyncDataRendererProps<T> {
	loading: boolean;
	error: Error | null;
	data: T | null;

	renderLoading?: () => React.ReactNode;
	renderError?: (error: Error) => React.ReactNode;
	renderData: (data: T) => React.ReactNode;
}

export default function AsyncDataRenderer<T>({
	                                             data,
	                                             loading,
	                                             error,
	                                             renderLoading,
	                                             renderError,
	                                             renderData
                                             }: AsyncDataRendererProps<T>) {
	if (!data && !loading && !error) return null;

	if (loading) return renderLoading ? renderLoading() : <>Loading...</>;
	if (error) return renderError ? renderError(error) : <>Error: {error.message}</>;
	if (!data) {
		const error = new Error("No data")
		return renderError ? renderError(error) : <>Error: {error.message}</>;
	}

	return renderData(data!);
}