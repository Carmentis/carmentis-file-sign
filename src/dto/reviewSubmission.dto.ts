import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewSubmissionDto {
    @IsIn(['accepted', 'declined'], {
        message: "The 'answer' must be either 'accepted' or 'declined'.",
    })
    answer: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Comment cannot be empty if provided.' })
    comment?: string;
}
